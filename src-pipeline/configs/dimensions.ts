import { extname } from 'path';
import { Glob } from 'bun';

import { isDirectory, nameFromPath, readJsonFileSync } from '@/utils/files';

export async function readDimensionsConfigDirectory() {
  const globResult = new Glob('input/data/dimensions/*').scanSync({
    onlyFiles: false,
  });

  const paths = [...globResult].toSorted();

  console.log('\nFound dimensions:');
  console.table(paths.map((path) => ({ name: nameFromPath(path), path, t: isDirectory(path) ? 'dir' : 'file' })));

  const dimensions = [];

  for (const path of paths) {
    const dimension = await loadDimensionConfigLocal(path);
    dimensions.push(dimension);
  }

  return dimensions;
}

export async function loadDimensionConfigLocal(path: string) {
  const isDir = isDirectory(path);

  if (isDir) {
    return loadDimensionConfigLocalDirectory(path);
  } else {
    return loadDimensionConfigLocalFile(path);
  }
}

export function loadDimensionConfigLocalDirectory(path: string) {
  return null;
}

export function loadDimensionConfigLocalFile(path: string) {
  const extension = extname(path);

  if (extension !== '.json') {
    throw new Error(`Dimensions config: single-file dimension definition must be a JSON file, but was: ${path}`);
  }

  const config = readJsonFileSync(path);
  console.log(config);
  return null;
}
