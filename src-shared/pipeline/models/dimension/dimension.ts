import { ColumnTable, from } from 'arquero';
import { unique } from 'remeda';

import { DimensionDomainConfig, IDimension } from './dimension-config-schema';

export const DIMENSION_METADATA_COLUMN_NAMES = ['id', 'label', 'color'] as const;

interface DimMetadataTypeColumn {
  name: string;
  type: 'metadata';
}

interface DimDimensionTypeColumnLinked {
  name: string;
  type: 'dimension';
  domainType: 'linked';
  domain: string;
}
interface DimDimensionTypeColumnLocal {
  name: string;
  type: 'dimension';
  domainType: 'local';
  domain: { id: string }[];
}

type DimensionColumn = DimMetadataTypeColumn | DimDimensionTypeColumnLocal | DimDimensionTypeColumnLinked;

export class Dimension implements IDimension {
  public readonly dimensionLinks: Map<string, Dimension> = new Map();
  public readonly domainValuesSet: ReadonlySet<string>;
  public readonly domainTable: ColumnTable;
  public readonly domainColumns: DimensionColumn[];

  constructor(
    public readonly id: string,
    public readonly domain: DimensionDomainConfig,
    public readonly label?: string,
  ) {
    this.domainValuesSet = new Set(domain.map((d) => d.id));

    const table = from(domain);
    const columnsWithColon: string[] = [];
    const tableColumns = table.columnNames();

    this.domainColumns = tableColumns.map((c) => {
      if (DIMENSION_METADATA_COLUMN_NAMES.includes(c)) {
        return { name: c, type: 'metadata' };
      }
      if (c.startsWith(':')) {
        columnsWithColon.push(c);
        const nameWithoutColon = c.slice(1);

        return { name: nameWithoutColon, type: 'dimension', domainType: 'linked', domain: nameWithoutColon };
      }
      return {
        name: c,
        type: 'dimension',
        domainType: 'local',
        domain: unique(this.domain.map((d) => d[c] as string)).map((x) => ({ id: x })),
      };
    });

    this.domainTable = table.rename(Object.fromEntries(columnsWithColon.map((c) => [c, c.slice(1)])));
  }

  public log() {
    console.log(`\n${this.id}:`);
    this.domainTable.print();
  }
}
