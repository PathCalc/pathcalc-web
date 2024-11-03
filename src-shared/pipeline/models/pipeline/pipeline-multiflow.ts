import { ProcessingContext } from '~shared/pipeline/utils/processing-context';

import { PipelineEnvironment } from './pipeline-environment';
import { PipelineFlow } from './pipeline-flow';

export class PipelineMultiflow {
  constructor(
    public id: string,
    public flows: PipelineFlow[],
  ) {}

  async dryRun(ctx: ProcessingContext, env: PipelineEnvironment) {
    // iterate over flows, with index
    for (const [index, flow] of this.flows.entries()) {
      await ctx
        .addPath(this.id)
        .addPath(index + '')
        .exec(async (c) => {
          console.log('\nMultiflow:', this.id, 'Sub-flow:', index + 1);
          await flow.dryRun(c, env);
        });
    }
  }

  async run() {
    throw new Error('Method not implemented.');
  }
}
