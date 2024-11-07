import { ColumnTable, from } from 'arquero';

import { DimensionTypeColumn } from './types';

export function makeDimensionLookupTable(originalPath: string, dimensionChain: DimensionTypeColumn[]): ColumnTable {
  const allTables = dimensionChain.slice(0, -1).map((d, ind, arr) => {
    if (d.domainType === 'linked') {
      return from(d.domain.content.table)
        .rename({ id: d.name })
        .select(d.name, dimensionChain[ind + 1].name);
    } else {
      return from(d.domain).rename({ id: d.name });
    }
  });

  const bigLookupTable = allTables.reduce((acc, table, ind) =>
    acc.lookup(table, undefined, dimensionChain[ind + 1].name),
  );

  const lastInChain = dimensionChain[dimensionChain.length - 1];
  const lastId = lastInChain.name;
  const firstId = dimensionChain[0].name;

  return bigLookupTable.select(lastId, firstId).rename({ [lastId]: originalPath });
}
