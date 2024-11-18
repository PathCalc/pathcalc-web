/** Check that two arrays have the same items (items compared using shallow equality) */
export function sameItems<T>(a: T[], b: T[]) {
  const aSet = new Set(a);
  const bSet = new Set(b);
  return aSet.size === bSet.size && [...aSet].every((v) => bSet.has(v));
}
