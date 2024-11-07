import { ColumnTable, op } from 'arquero';
import { z } from 'zod';

import { findNavigationSequence } from '~shared/pipeline/models/dataset/find-navigation-sequence';
import { resolveAllInDimensionNavigationSequence } from '~shared/pipeline/models/dataset/follow-navigation-sequence';
import { makeDimensionLookupTable } from '~shared/pipeline/models/dataset/make-dimension-lookup-table';
import { Dataset, DatasetShard, ReadonlyDataset, ReadonlyDatasetShard } from '~shared/pipeline/models/dataset/types';
import { PipelineEnvironment } from '~shared/pipeline/models/pipeline/pipeline-environment';
import { PipelineStep } from '~shared/pipeline/models/pipeline/pipeline-step';
import { dimensionPathSchema } from '~shared/pipeline/models/transforms/transforms';
import { UnexpectedError } from '~shared/pipeline/utils/errors';
import { ProcessingContext } from '~shared/pipeline/utils/processing-context';

export const DEFAULT_AGGREGATION = 'sum';

export const opAggregateSchema = z.object({
  $: z.literal('aggregate'),
  groupby: z.array(dimensionPathSchema),
});

export type AggregateConfig = z.infer<typeof opAggregateSchema>;

export class AggregateStep extends PipelineStep {
  private _inDataset: ReadonlyDataset | undefined = undefined;

  private _dimLookups: Map<string, [string, ColumnTable]> | undefined = undefined;

  constructor(private _config: AggregateConfig) {
    super(_config);
  }

  async dryRun(
    ctx: ProcessingContext,
    dataset: ReadonlyDataset,
    env: PipelineEnvironment,
    tempVars: Map<string, ReadonlyDataset>,
  ) {
    if (dataset == null) {
      throw new Error(`${this._config.$} cannot be the first step in a flow`);
    }
    const groupby: string[] = this._config.groupby;

    const datasetCopy = structuredClone(dataset) as Dataset;
    this._inDataset = datasetCopy;
    const currentColumns = datasetCopy.columns;
    const currentColumnNames = new Set(currentColumns.map((c) => c.name));
    const missingColumnsNames = groupby.filter((c) => !currentColumnNames.has(c));

    this._dimLookups = new Map();

    const newColumns = datasetCopy.columns.filter((c) => groupby.includes(c.name) || c.type === 'measure');

    for (const missingColumn of missingColumnsNames) {
      const navigationSequence = findNavigationSequence(currentColumns, missingColumn);

      if (navigationSequence == null) {
        throw new Error(`Column "${missingColumn}" is not present in the data`);
      }

      // insert the nested column directly into the new dataset columns
      const allSteps = resolveAllInDimensionNavigationSequence(currentColumns, navigationSequence);

      // build the lookup table between the original dataset column values, and the new column values - based on all the intermediate tables in the navigation sequence
      const lookupTable = makeDimensionLookupTable(missingColumn, allSteps);
      this._dimLookups.set(missingColumn, [allSteps[0].name, lookupTable]);

      const column = allSteps[allSteps.length - 1];
      column.label ??= column.name;
      column.name = missingColumn;
      newColumns.push(column);
    }

    datasetCopy.columns = newColumns;

    return datasetCopy;
  }

  async processShard(
    ctx: ProcessingContext,
    datasetShard: DatasetShard,
    tempVarsSharded: Map<string, ReadonlyDatasetShard>,
  ): Promise<DatasetShard> {
    if (this._inDataset == null || this._dimLookups == null) {
      throw new UnexpectedError('Pipeline step was not initialised before running.');
    }

    let table = datasetShard.table;

    for (const [newDim, [lookupKey, lookupTable]] of this._dimLookups?.entries() ?? []) {
      table = table.lookup(lookupTable, lookupKey, newDim);
    }

    const measureColumns = this._inDataset.columns.filter((c) => c.type === 'measure');
    const measureAggOps = measureColumns
      .filter((c) => c.type === 'measure')
      .map((c) => [c.name, getArqueroAggOp(c.aggregationMethod ?? DEFAULT_AGGREGATION)(c.name)] as [string, number]);
    const rollupExpr = Object.fromEntries(measureAggOps);

    table = table.groupby(this._config.groupby).rollup(rollupExpr);

    const newDatasetShard = structuredClone(datasetShard);
    newDatasetShard.table = table;
    return newDatasetShard;
  }
}

type AggOp = (field: any) => number;

function getArqueroAggOp(aggOp: string): AggOp {
  switch (aggOp) {
    case 'sum':
      return op.sum;
    default:
      throw new Error(`Unknown aggregation method: ${aggOp}`);
  }
}
