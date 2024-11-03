import { ProcessingContext } from '~shared/pipeline/utils/processing-context';

import { PipelineEnvironment } from './pipeline-environment';
import { PipelineStep } from './pipeline-step';

export class PipelineFlow {
  constructor(public steps: PipelineStep[]) {}

  async dryRun(ctx: ProcessingContext, env: PipelineEnvironment) {
    console.table(
      this.steps.map((f) => ({
        step: f.config.$,
      })),
    );
    for (const [index, step] of this.steps.entries()) {
      await ctx.addPath(index + '').exec(async () => {
        console.log('\nStep:', index + 1);
        console.log(step.config);
      });
    }
  }
}
