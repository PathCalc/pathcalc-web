import { ConfigError } from '~shared/pipeline/utils/errors';
import { ProcessingContext } from '~shared/pipeline/utils/processing-context';

import { ServerPipeline } from './server-pipeline';

const multiflowIds = process.argv.slice(2);

const serverPipeline = new ServerPipeline();

const ctx = new ProcessingContext();
try {
  console.log('Running pipeline FULL RUN...');
  if (multiflowIds.length > 0) {
    console.log(`Processing pipeline files: ${multiflowIds.join(', ')}`);
  } else {
    console.log('Processing all pipeline files');
  }

  await ctx.addContext('Full run:').exec(async (c) => {
    await serverPipeline.run(ctx, multiflowIds.length > 0 ? multiflowIds : undefined);
    console.log('Pipeline finished without errors.');
  });
} catch (e) {
  reportError(e);
}

function reportError(e: unknown) {
  if (e instanceof ConfigError) {
    console.error(e.message);
  } else {
    console.error('An unexpected error occurred. This might be a bug in the pipeline:');
    console.error(e);
  }
}
