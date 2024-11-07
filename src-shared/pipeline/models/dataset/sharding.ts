export function isShardingSame(sharding1: string[], sharding2: string[]): boolean {
  return new Set(sharding1).symmetricDifference(new Set(sharding2)).size === 0;
}
