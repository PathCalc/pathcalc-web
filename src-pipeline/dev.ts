import { watch } from 'fs';

import { ConfigError } from '../src-shared/pipeline/utils/errors';
import { FileChanges, ServerPipeline } from './server-pipeline';

console.clear();

console.log('Watching for changes in input/...');

let rerun = true;
const fileChanges: FileChanges = new Map();

const watcher = watch('input/', { recursive: true }, (event, filename) => {
  console.clear();
  console.log(`Detected ${event} in ${filename}`);

  rerun = true;
  if (filename) {
    fileChanges.set(filename, event);
  }
});

let running = false;
// event loop that checks if rerun is needed and runs the pipeline (awaiting its completion)
const eventLoopInterval = setInterval(() => {
  void (async function () {
    if (!running && rerun) {
      rerun = false;
      running = true;
      await doAll(fileChanges);
      running = false;
      fileChanges.clear();
    }
  })();
}, 100);

process.on('SIGINT', () => {
  // close watcher when Ctrl-C is pressed
  console.log('\nClosing watcher...');
  watcher.close();
  clearInterval(eventLoopInterval);

  process.exit(0);
});

const serverPipeline = new ServerPipeline();

async function doAll(fileChanges: FileChanges) {
  console.log('Rerunning pipeline...');
  try {
    await serverPipeline.dryRun(fileChanges);
    console.log('Pipeline finished without errors.');
  } catch (e) {
    reportError(e);
  }
}

function reportError(e: unknown) {
  if (e instanceof ConfigError) {
    console.error(e);
  } else {
    console.error('An unexpected error occurred. This might be a bug in the pipeline:');
    console.error(e);
  }
}
