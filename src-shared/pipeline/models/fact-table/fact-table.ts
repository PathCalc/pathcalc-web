import { ColumnTable } from 'arquero';

import { Dataset } from '../dataset/types';
import { Dimension } from '../dimension/dimension';
import { FactTableConfigColumn, FactTableStorageType, FactTableType } from './fact-table-config-schema';

export abstract class FactTable {
  public readonly linkedDimensions: Map<string, Dimension> = new Map();
  constructor(
    public readonly id: string,
    public readonly type: FactTableType,
    public readonly sharding: string[],
    public readonly storage: { type: FactTableStorageType; pattern: string },
  ) {}

  /** Load data table from storage */
  abstract load(shard: Record<string, string>): Promise<ColumnTable>;
  abstract dryRunLoad(): Promise<void>;

  /** Save data table to storage */
  abstract save(shard: Record<string, string>, data: ColumnTable): Promise<void>;
  abstract dryRunSave(): Promise<void>;

  async saveDataset(dataset: Dataset): Promise<void> {
    throw new Error('Method not implemented.');
  }

  log() {
    console.log(`\nFact table: ${this.id} (no columns)`);
  }
}

export abstract class SourceFactTable extends FactTable {
  constructor(
    id: string,
    type: 'raw',
    sharding: string[],
    storage: { type: FactTableStorageType; pattern: string },
    public readonly columns: FactTableConfigColumn[],
  ) {
    super(id, type, sharding, storage);
  }

  log() {
    console.log(`\nFact table: ${this.id}`);
    console.table(
      this.columns.map((c: any) => ({
        name: c.name,
        type: c.type,
        label: c.label,
        unit: c.unit,
        aggregationMethod: c.aggregationMethod,
      })),
    );
  }
}

export abstract class WebFactTable extends FactTable {
  constructor(id: string, type: 'web', sharding: string[], storage: { type: FactTableStorageType; pattern: string }) {
    super(id, type, sharding, storage);
  }
}
