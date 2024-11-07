import { ProcessingContext } from '~shared/pipeline/utils/processing-context';

import { Dataset, DatasetShard, ReadonlyDataset, ReadonlyDatasetShard } from '../dataset/types';
import { PipelineStepConfig } from './pipeline-config-schema';
import { PipelineEnvironment } from './pipeline-environment';

export abstract class PipelineStep {
  constructor(public readonly config: PipelineStepConfig) {}

  abstract reset(): Promise<void>;

  abstract dryRun(
    ctx: ProcessingContext,
    dataset: ReadonlyDataset | undefined,
    env: PipelineEnvironment,
    tempVars: Map<string, ReadonlyDataset>,
  ): Promise<Dataset>;

  startShardedRun(ctx: ProcessingContext): Promise<void> {
    // do nothing
    return Promise.resolve();
  }

  abstract processShard(
    ctx: ProcessingContext,
    // not readonly as we're passing around a single instance
    datasetShard: DatasetShard,
    tempVarsSharded: Map<string, ReadonlyDatasetShard>,
  ): Promise<DatasetShard>;

  endShardedRun(ctx: ProcessingContext): Promise<void> {
    // do nothing
    return Promise.resolve();
  }
}
