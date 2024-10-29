import { ColumnTable } from 'arquero';

export function checkPrimaryKey(data: ColumnTable, primaryKey: string[]) {
  const numRows = data.numRows();

  const numRowsDeduped = data.dedupe(primaryKey).numRows();

  if (numRows !== numRowsDeduped) {
    throw new Error('Primary key check failed');
  }
}

function orderMap<T>(values: T[]): Map<T, number> {
  return new Map(values.map((v, i) => [v, i]));
}

export function orderByList<T>(columnId: string, ordering: T[]) {
  const om = orderMap(ordering);

  return (d: any) => om.get(d[columnId]);
}

export function sameItems<T>(a: T[], b: T[]) {
  const aSet = new Set(a);
  const bSet = new Set(b);
  return aSet.size === bSet.size && [...aSet].every((v) => bSet.has(v));
}
