import { ColumnTable, op } from 'arquero';
import * as aq from 'arquero';
import { z } from 'zod';

import { findNavigationSequence } from '~shared/pipeline/models/dataset/find-navigation-sequence';
import { resolveAllInDimensionNavigationSequence } from '~shared/pipeline/models/dataset/follow-navigation-sequence';
import { makeDimensionLookupTable } from '~shared/pipeline/models/dataset/make-dimension-lookup-table';
import {
  Dataset,
  DatasetShard,
  DimensionTypeColumn,
  ReadonlyDataset,
  ReadonlyDatasetShard,
} from '~shared/pipeline/models/dataset/types';
import { PipelineEnvironment } from '~shared/pipeline/models/pipeline/pipeline-environment';
import { PipelineStep } from '~shared/pipeline/models/pipeline/pipeline-step';
import { dimensionPathSchema } from '~shared/pipeline/models/transforms/dimension-path-schema';
import { UnexpectedError } from '~shared/pipeline/utils/errors';
import { ProcessingContext } from '~shared/pipeline/utils/processing-context';

export const opFilterSchema = z
  .object({
    $: z.literal('filter'),
    column: dimensionPathSchema.describe(`Column to filter by. \n${dimensionPathSchema.description}`),
    in: z.array(z.string()).describe('List of values to filter.'),
  })
  .describe('Operation to filter the dataset based on the values of a single column.');

type FilterConfig = z.infer<typeof opFilterSchema>;

export class FilterStep extends PipelineStep {
  private _inDataset: ReadonlyDataset | undefined = undefined;

  private _dimLookup: [lookupKey: string, lookupTable: ColumnTable] | undefined = undefined;

  constructor(private _config: FilterConfig) {
    super(_config);
  }

  async reset() {
    this._inDataset = undefined;
    this._dimLookup = undefined;
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

    this._inDataset = structuredClone(dataset) as Dataset;
    const datasetCopy = structuredClone(dataset) as Dataset;

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

      const dimensionToFilter = allSteps[allSteps.length - 1];
      filterDownColumn(dimensionToFilter, values);
    } else {
      if (foundColumn.type !== 'dimension') {
        throw new Error(`Column "${column}" is not a dimension`);
      }
      filterDownColumn(foundColumn, values);
    }

    return datasetCopy;
  }

  async processShard(
    ctx: ProcessingContext,
    datasetShard: DatasetShard,
    tempVarsSharded: Map<string, ReadonlyDatasetShard>,
  ): Promise<DatasetShard> {
    if (datasetShard.table == null) {
      throw new Error(`${this._config.$} cannot be the first step in a flow`);
    }
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

    table = table.filter((row, $) => op.includes($.values, row[$.column]));

    if (this._dimLookup != null) {
      table = table.select(aq.not(column));
    }

    const newDatasetShard = structuredClone(datasetShard);
    newDatasetShard.table = table;

    return newDatasetShard;
  }
}

function filterDownColumn(column: DimensionTypeColumn, values: string[]) {
  if (column.domainType === 'local') {
    column.domain = column.domain.filter((d) => values.includes(d.id));
  } else {
    column.domain.content.table = column.domain.content.table.filter((r) => values.includes(r['id']));
  }
}
