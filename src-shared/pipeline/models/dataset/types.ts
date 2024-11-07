import { ColumnTable } from 'arquero';
import { ReadonlyDeep, Simplify } from 'type-fest';

import { DIMENSION_METADATA_COLUMN_NAMES } from '../dimension/dimension';
import { MeasureColumnConfig } from '../fact-table/fact-table-config-schema';

export type DimensionPath = string;

export type MeasureTypeColumn = Simplify<
  MeasureColumnConfig & {
    stats?: any; // TODO
  }
>;

export type MetadataColumnName = (typeof DIMENSION_METADATA_COLUMN_NAMES)[number];

export type MetadataTypeColumn = {
  name: MetadataColumnName;
  type: 'metadata';
};

export type DatasetDimensionColumn = MetadataTypeColumn | DimensionTypeColumn;

export interface DatasetDimension {
  id: string;
  label?: string;
  content: {
    table: Record<string, any>[];
    columns: DatasetDimensionColumn[];
  };
}

export type DimensionColumnDomainLinked = {
  domainType: 'linked';
  domain: DatasetDimension;
};

export type LocalDomainEntry = { id: string };

export type DimensionColumnDomainLocal = {
  domainType: 'local';
  domain: LocalDomainEntry[];
};

interface DimensionColumnBase {
  name: string;
  label?: string;
  type: 'dimension';
}

export type DimensionTypeColumnLinked = DimensionColumnBase & DimensionColumnDomainLinked;
export type DimensionTypeColumnLocal = DimensionColumnBase & DimensionColumnDomainLocal;

export type DimensionTypeColumn = Simplify<DimensionTypeColumnLinked | DimensionTypeColumnLocal>;

export type DatasetColumn = DimensionTypeColumn | MeasureTypeColumn;

export interface Dataset {
  columns: DatasetColumn[];
  sharding: string[];
}

export type ReadonlyDataset = ReadonlyDeep<Dataset>;

export interface DatasetShard {
  table: ColumnTable;
  shard: Record<string, any>;
}

export type ReadonlyDatasetShard = ReadonlyDeep<DatasetShard>;
