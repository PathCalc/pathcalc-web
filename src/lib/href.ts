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
  const base = import.meta.env.PUBLIC_ENV__BASE_URL;
  if (base == null || h.startsWith(base)) {
    return normalizePath(h);
  }

  return normalizePath(base + h);
}

/**
 * Normalizes a URL path:
 * - ensures no duplicate slashes
 * - ensures a trailing slash
 * @param path the URL path to normalize
 * @returns normalized path
 */
export function normalizePath(path: string) {
  const h = '/' + path.split('/').filter(Boolean).join('/');
  return h === '/' ? h : h + '/';
}
