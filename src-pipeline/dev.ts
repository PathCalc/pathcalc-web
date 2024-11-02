import { watch } from 'fs';

import { readDimensionsConfigDirectory } from './configs/dimensions';

console.clear();

console.log('Watching for changes in input/...');

let rerun = true;

const watcher = watch('input/', { recursive: true }, (event, filename) => {
  console.clear();
  console.log(`Detected ${event} in ${filename}`);

  rerun = true;
});

let running = false;
// event loop that checks if rerun is needed and runs the pipeline (awaiting its completion)
const eventLoopInterval = setInterval(async () => {
  if (!running && rerun) {
    rerun = false;
    running = true;
    await doAll();
    running = false;
  }
}, 100);

process.on('SIGINT', () => {
  // close watcher when Ctrl-C is pressed
  console.log('\nClosing watcher...');
  watcher.close();
  clearInterval(eventLoopInterval);

  process.exit(0);
});

async function doAll() {
  console.log('Rerunning pipeline...');
  try {
    readDimensionsConfigDirectory();
  } catch (e) {
    if (e instanceof Error) {
      reportError(e);
    } else {
      console.error(e);
    }
  }
}

function reportError(e: Error) {
  console.error(e);
  console.error(e.stack);
}
