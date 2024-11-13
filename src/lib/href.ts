/**
 * Modify a URL href value to include the base URL.
 * If href is external, don't modify.
 * If href already starts with base URL, don't modify.
 * @param h the
 * @returns modified href
 */
export function makeHref(h: string) {
  if (h.startsWith('http://') || h.startsWith('https://')) {
    return h;
  }
  const base: string | undefined = import.meta.env.PUBLIC_ENV__BASE_URL ?? '';
  return normalizePath(base + h);
}

function removeDuplicateSlashes(path: string) {
  return path.replace(/\/{2,}/g, '/');
}

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  it.each([
    ['', ''],
    ['/', '/'],
    ['//', '/'],
    ['a', 'a'],
    ['a/', 'a/'],
    ['/a', '/a'],
    ['/a/', '/a/'],
    ['a//b', 'a/b'],
    ['a//b/', 'a/b/'],
    ['/a//b', '/a/b'],
    ['/a//b/', '/a/b/'],
  ])('removeDuplicateSlashes("%s") -> "%s"', (x: string, expected: string) => {
    expect(removeDuplicateSlashes(x)).toBe(expected);
  });
}

/**
 * Normalizes a URL path:
 * - ensures no duplicate slashes
 * - ensures a trailing slash
 * @param path the URL path to normalize
 * @returns normalized path
 */
export function normalizePath(path: string) {
  return removeDuplicateSlashes(path + '/');
}

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  it.each([
    ['', '/'],
    ['/', '/'],
    ['a', 'a/'],
    ['a/', 'a/'],
    ['/a', '/a/'],
    ['/a/', '/a/'],
    ['a/b', 'a/b/'],
    ['a/b/', 'a/b/'],
    ['/a/b', '/a/b/'],
    ['/a/b/', '/a/b/'],
    ['a///b', 'a/b/'],
    ['a///b/', 'a/b/'],
    ['/a///b', '/a/b/'],
  ])('normalizePath("%s") -> "%s"', (x, expected) => {
    expect(normalizePath(x)).toBe(expected);
  });
}

export function makeFilePath(p: string) {
  const base: string | undefined = import.meta.env.PUBLIC_ENV__BASE_URL;
  return removeDuplicateSlashes((base != null ? base + '/' : '') + p);
}
