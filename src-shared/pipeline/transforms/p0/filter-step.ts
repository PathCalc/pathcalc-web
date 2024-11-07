import { ColumnTable, op } from 'arquero';
import * as aq from 'arquero';
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

export const opFilterSchema = z.object({
  $: z.literal('filter'),
  column: dimensionPathSchema,
  in: z.array(z.string()),
});

type FilterConfig = z.infer<typeof opFilterSchema>;

export class FilterStep extends PipelineStep {
  private _inDataset: ReadonlyDataset | undefined = undefined;

  private _dimLookup: [string, ColumnTable] | undefined = undefined;

  constructor(private _config: FilterConfig) {
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
    const column: string = this._config.column;
    const values: string[] = this._config.in;

    const datasetCopy = structuredClone(dataset) as Dataset;
    this._inDataset = datasetCopy;

    const currentColumns = datasetCopy.columns;

    const foundColumn = currentColumns.find((c) => c.name === column);

    if (foundColumn == null) {
      const navigationSequence = findNavigationSequence(currentColumns, column);

      if (navigationSequence == null) {
        throw new Error(`Column "${column}" is not present in the data`);
      }

      // insert the nested column directly into the new dataset columns
      const allSteps = resolveAllInDimensionNavigationSequence(currentColumns, navigationSequence);

      // build the lookup table between the original dataset column values, and the new column values - based on all the intermediate tables in the navigation sequence
      const lookupTable = makeDimensionLookupTable(column, allSteps);
      this._dimLookup = [allSteps[0].name, lookupTable];
    }

    return datasetCopy;
  }

  async processShard(
    ctx: ProcessingContext,
    datasetShard: DatasetShard,
    tempVarsSharded: Map<string, ReadonlyDatasetShard>,
  ): Promise<DatasetShard> {
    if (this._inDataset == null) {
      throw new UnexpectedError('Pipeline step was not initialised before running');
    }

    const column = this._config.column;
    const values = this._config.in;

    let table = datasetShard.table;

    if (this._dimLookup != null) {
      const [lookupKey, lookupTable] = this._dimLookup;

      table = table.lookup(lookupTable, lookupKey, column);
    }

    table = table.params({
      values: values,
      column: column,
    }) as ColumnTable;

    table = table.filter((row, $) => op.includes($!.values, row![$!.column]));

    if (this._dimLookup != null) {
      table = table.select(aq.not(column));
    }

    const newDatasetShard = structuredClone(datasetShard);
    newDatasetShard.table = table;

    return newDatasetShard;
  }
}
