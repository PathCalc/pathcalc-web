import { readdirSync, readFileSync } from 'node:fs';
import { basename } from 'path';

/**
 * Gets the name of a directory (or file, without the extensions) from a full path
 * @param path
 */
export function nameFromPath(path: string) {
  return basename(path).split('.').shift();
  //   return path.split('/').pop()?.split('.').shift();
}

export function isDirectory(path: string) {
  return directoryExists(path);
}

export function directoryExists(path: string) {
  let exists = false;
  try {
    readdirSync(path);
    exists = true;
  } catch (e) {
    exists = false;
  }
  return exists;
}

export function readJsonFileSync(path: string) {
  const content = readFileSync(path, 'utf-8');
  return JSON.parse(content);
}
