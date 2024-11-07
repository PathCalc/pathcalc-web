import { z } from 'zod';

import { isShardingSame } from '~shared/pipeline/models/dataset/sharding';
import { Dataset, DatasetShard, ReadonlyDataset, ReadonlyDatasetShard } from '~shared/pipeline/models/dataset/types';
import { WebFactTable } from '~shared/pipeline/models/fact-table/fact-table';
import { PipelineEnvironment } from '~shared/pipeline/models/pipeline/pipeline-environment';
import { PipelineStep } from '~shared/pipeline/models/pipeline/pipeline-step';
import { UnexpectedError } from '~shared/pipeline/utils/errors';
import { ProcessingContext } from '~shared/pipeline/utils/processing-context';

export const opSaveSchema = z.object({
  $: z.literal('save'),
  to: z.string(),
  sharding: z.array(z.string()),
});

export type SaveConfig = z.infer<typeof opSaveSchema>;

export class SaveStep extends PipelineStep {
  private _targetFactTable: WebFactTable | undefined;
  private _inDataset: Dataset | undefined;

  constructor(private _config: SaveConfig) {
    super(_config);
  }

  async reset() {
    this._targetFactTable = undefined;
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
    if (this._targetFactTable == null) {
      throw new UnexpectedError('Pipeline was not initialised before running');
    }

    await this._targetFactTable.save(datasetShard.shard, datasetShard.table);

    return datasetShard;
  }

  async endShardedRun(): Promise<void> {
    if (this._targetFactTable == null || this._inDataset == null) {
      throw new UnexpectedError('Pipeline was not initialised before running');
    }
    // save dataset metadata
    await this._targetFactTable.saveDataset(this._inDataset);
  }
}

function fmtSharding(sharding: string[]): string {
  return sharding.join(', ');
}
