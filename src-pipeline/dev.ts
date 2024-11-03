import { watch, WatchEventType } from 'fs';
import { ZodError } from 'zod';

import { readDimensionsConfigDirectory } from './configs/dimensions';
import { ProcessingContext } from './utils/processing-context';

console.clear();

console.log('Watching for changes in input/...');

type FileChanges = Map<string, WatchEventType>;
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
const eventLoopInterval = setInterval(async () => {
  if (!running && rerun) {
    rerun = false;
    running = true;
    await doAll(fileChanges);
    running = false;
    fileChanges.clear();
  }
}, 100);

process.on('SIGINT', () => {
  // close watcher when Ctrl-C is pressed
  console.log('\nClosing watcher...');
  watcher.close();
  clearInterval(eventLoopInterval);

  process.exit(0);
});

async function doAll(fileChanges: FileChanges) {
  console.log('Rerunning pipeline...');
  try {
    const ctx = new ProcessingContext();
    const dimensions = await ctx.addContext('Dimensions config').exec((c) => readDimensionsConfigDirectory(c));

    console.table(
      [...dimensions.values()].map((d) => ({
        id: d.id,
        label: d.label,
        valueCount: d.domainValuesSet.size,
        links: [...d.dimensionLinks.values()].map((x) => x.id).join(', '),
      })),
    );

    console.log('Pipeline finished without errors.');
  } catch (e) {
    reportError(e);
  }
}

function reportError(e: unknown) {
  if (e instanceof ZodError) {
    console.error(e.toString());
  } else if (e instanceof Error) {
    console.error(e.message);
  } else {
    console.error(e);
  }
}
