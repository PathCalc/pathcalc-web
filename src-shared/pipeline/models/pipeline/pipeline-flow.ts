import { ProcessingContext } from '~shared/pipeline/utils/processing-context';

import { Dataset } from '../dataset/types';
import { PipelineEnvironment } from './pipeline-environment';
import { PipelineStep } from './pipeline-step';

export class PipelineFlow {
  constructor(public readonly steps: PipelineStep[]) {
    if (steps.length === 0) {
      throw new Error('Pipeline flow must have at least one step');
    }
  }

  public async dryRun(
    ctx: ProcessingContext,
    env: PipelineEnvironment,
    tempVars: Map<string, Dataset>,
  ): Promise<Dataset> {
    console.table(
      this.steps.map((f) => ({
        step: f.config.$,
      })),
    );
    let currentDataset: Dataset | undefined;

    for (const [index, step] of this.steps.entries()) {
      currentDataset = await ctx.addPath(index + '').exec(async () => {
        console.log('\nStep:', index + 1);
        const newDataset = await step.dryRun(ctx, currentDataset, env, tempVars);

        if (newDataset == null) {
          throw new Error('Step did not return a dataset');
        }

        console.log(newDataset);
        // console.log(
        //   (newDataset.columns.find((c) => c.name === 'TECHNOLOGY') as DimensionTypeColumnLinked).domain.content.columns,
        // );

        return newDataset;
      });
    }

    return currentDataset!;
  }

  public async processShard() {}
}
