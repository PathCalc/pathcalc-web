import { ColumnTable, op } from 'arquero';
import { DeepMap } from 'deep-equality-data-structures';
import { z } from 'zod';

import { isShardingSame } from '~shared/pipeline/models/dataset/sharding';
import {
  ChartStat,
  Dataset,
  DatasetShard,
  ReadonlyDataset,
  ReadonlyDatasetShard,
} from '~shared/pipeline/models/dataset/types';
import { WebFactTable } from '~shared/pipeline/models/fact-table/fact-table';
import { PipelineEnvironment } from '~shared/pipeline/models/pipeline/pipeline-environment';
import { PipelineStep } from '~shared/pipeline/models/pipeline/pipeline-step';
import { ChartStatDefinition, ChartStatResult } from '~shared/pipeline/models/stats';
import { UnexpectedError } from '~shared/pipeline/utils/errors';
import { ProcessingContext } from '~shared/pipeline/utils/processing-context';

export const opSaveSchema = z.object({
  $: z.literal('save'),
  to: z.string(),
  sharding: z.array(z.string()),
  stats: z
    .object({
      xaxis: z.string(),
    })
    .optional(),
});

export type SaveConfig = z.infer<typeof opSaveSchema>;

// types of charts for which to calculate statistics
const STAT_TYPES: Omit<ChartStatDefinition, 'grouping'>[] = [
  { crossSectionType: 'line', stacked: false },
  { crossSectionType: 'line', stacked: true },
  { crossSectionType: 'point', stacked: false },
];

export class SaveStep extends PipelineStep {
  private _targetFactTable: WebFactTable | undefined;
  private _inDataset: Dataset | undefined;
  private _statDefs: ChartStatDefinition[] = [];

  private _columnStats: Map<string, DeepMap<ChartStatDefinition, ChartStatResult>> = new Map();
  // private _stats: DeepMap<ChartStatDefinition, ChartStatResult> = new DeepMap();

  constructor(private _config: SaveConfig) {
    super(_config);
  }

  async reset() {
    this._targetFactTable = undefined;
    this._statDefs = [];
  }

  async dryRun(
    ctx: ProcessingContext,
    dataset: ReadonlyDataset,
    env: PipelineEnvironment,
    tempVars: Map<string, ReadonlyDataset>,
  ): Promise<Dataset> {
    if (dataset == null) {
      throw new Error('$save cannot appear as the first step in a flow');
    }
    const datasetCopy = structuredClone(dataset) as Dataset;
    this._inDataset = datasetCopy;

    const to = this._config.to;
    if (to == null || typeof to !== 'string') {
      throw new Error('$save step must have "to" field defined');
    }
    const foundFactTable = env.factTables.get(to);
    if (foundFactTable == null) {
      throw new Error(`Target fact table not found: ${to}`);
    }
    if (foundFactTable.type !== 'web') {
      throw new Error(
        `Server pipeline can only save to web tables. Tried to save to ${to} which has type: ${foundFactTable.type}`,
      );
    }
    const targetFactTable: WebFactTable = foundFactTable;
    this._targetFactTable = targetFactTable;

    await targetFactTable.dryRunSave();
    // if (targetFactTable.type !== 'web') {
    //   throw new Error(
    //     `Server pipeline can only save to web tables. Tried to save to ${to} which has type: ${targetFactTable.type}`,
    //   );
    // }

    const stepConfigSharding = this._config.sharding;
    if (stepConfigSharding == null) {
      throw new Error('$save step must have sharding defined');
    }
    const targetSharding = targetFactTable.sharding;
    if (!isShardingSame(stepConfigSharding, targetSharding)) {
      throw new Error(
        `Sharding specified in $:save config (${fmtSharding(stepConfigSharding)}) does not match sharding of target fact table (${fmtSharding(targetSharding)})`,
      );
    }

    const currentDatasetSharding = datasetCopy.sharding;

    const shardingSame = isShardingSame(currentDatasetSharding, targetSharding);
    if (!shardingSame) {
      throw new Error(
        `Sharding of dataset (${fmtSharding(currentDatasetSharding)}) does not match sharding of target fact table (${fmtSharding(targetSharding)})`,
      );
    }

    if (this._config.stats) {
      const xaxis = this._config.stats.xaxis;
      if (!datasetCopy.columns.some((c) => c.name === xaxis)) {
        throw new Error(`X axis column ${xaxis} not found in dataset`);
      }

      // this does not contain the sharding columns as those never appear in the actual tables but are added to the final metadata when saving
      const grouping = [xaxis];
      for (const statDef of STAT_TYPES) {
        const definition: ChartStatDefinition = {
          grouping,
          ...statDef,
        };
        this._statDefs.push(definition);
      }
    }

    return datasetCopy;
  }

  async startShardedRun(ctx: ProcessingContext): Promise<void> {
    if (this._targetFactTable == null || this._inDataset == null) {
      throw new UnexpectedError('Pipeline was not initialised before running');
    }

    this._columnStats.clear();

    if (this._config.stats) {
      // this does not contain the sharding columns as those never appear in the actual tables but are added to the final metadata when saving
      const grouping = [this._config.stats.xaxis];
      for (const statDef of STAT_TYPES) {
        const definition: ChartStatDefinition = {
          grouping,
          ...statDef,
        };
        this._statDefs.push(definition);
      }

      for (const column of this._inDataset.columns.filter((c) => c.type === 'measure')) {
        this._columnStats.set(
          column.name,
          new DeepMap(this._statDefs.map((statDef) => [statDef, { lower: +Infinity, upper: -Infinity }])),
        );
      }
    }
  }

  async processShard(
    ctx: ProcessingContext,
    datasetShard: DatasetShard,
    tempVarsSharded: Map<string, ReadonlyDatasetShard>,
  ): Promise<DatasetShard> {
    if (datasetShard.table == null) {
      throw new Error(`${this._config.$} cannot be the first step in a flow`);
    }
    if (this._targetFactTable == null) {
      throw new UnexpectedError('Pipeline was not initialised before running');
    }

    await this._targetFactTable.save(datasetShard.shard, datasetShard.table);
    await this._updateStats(datasetShard);

    return datasetShard;
  }

  private async _updateStats(datasetShard: DatasetShard) {
    for (const [columnName, stats] of this._columnStats.entries()) {
      for (const [statDef, statResult] of stats.entries()) {
        const newResult = updateStats(datasetShard.table!, statResult, columnName, statDef);
        stats.set(statDef, newResult);
      }
    }
  }

  async endShardedRun(): Promise<void> {
    if (this._targetFactTable == null || this._inDataset == null) {
      throw new UnexpectedError('Pipeline was not initialised before running');
    }

    // clone dataset for saving with stats
    const outDataset = structuredClone(this._inDataset);

    // add stats to columns
    for (const [columnName, stats] of this._columnStats.entries()) {
      const column = outDataset.columns.find((c) => c.name === columnName);
      if (column == null) {
        throw new UnexpectedError(`Column ${columnName} not found in dataset`);
      }
      if (column.type !== 'measure') {
        throw new UnexpectedError(`Column ${columnName} is not a measure column`);
      }
      const statsList: ChartStat[] = Array.from(stats.entries()).map(([statDef, statResult]) => ({
        definition: {
          crossSectionType: statDef.crossSectionType,
          stacked: statDef.stacked,
          // add sharding columns to grouping
          grouping: [...statDef.grouping, ...outDataset.sharding],
        },
        result: statResult,
      }));
      column.stats = statsList;
    }
    console.log(outDataset);
    // save dataset metadata
    await this._targetFactTable.saveDataset(outDataset);
  }
}

function fmtSharding(sharding: string[]): string {
  return sharding.join(', ');
}

/*

stats results:
- per dimension column combination
- per cross section type + stacked

*/

function updateStats(
  table: ColumnTable,
  result: ChartStatResult,
  columnName: string,
  definition: ChartStatDefinition,
): ChartStatResult {
  const { grouping, crossSectionType, stacked } = definition;
  let lower = Infinity,
    upper = -Infinity;

  if (crossSectionType === 'line') {
    // bar and area charts

    if (stacked) {
      // stacked bar/area charts - calculation equivalent to stackOffset: diverging in D3
      table = table.params({
        cname: columnName,
      }) as ColumnTable;

      table = table
        .derive({
          sign: (d, $) => op.sign(d![$!.cname]),
        })
        .groupby(...grouping, 'sign')
        .rollup({ [columnName]: op.sum(columnName) });
    }

    [lower, upper] = minmax(table, columnName);

    // for bars/areas, we want to ensure the bounds include zero
    if (lower >= 0 && upper >= 0) {
      // if all values positive, lower bound should be zero
      lower = 0;
    } else if (lower <= 0 && upper <= 0) {
      // if all values negative, upper bound should be zero
      upper = 0;
    }
  } else {
    // line charts
    [lower, upper] = minmax(table, columnName);
  }

  // extend the stats so far using the new results
  return {
    lower: Math.min(result.lower, lower),
    upper: Math.max(result.upper, upper),
  };
}

function minmax(table: ColumnTable, columnName: string) {
  const aggregated = table.rollup({ min: op.min(columnName), max: op.max(columnName) });
  const { min, max } = aggregated.objects()[0] as { min: number; max: number };
  return [min, max];
}
