import { Dimension } from '../dimension/dimension';
import { FactTableStorageType, FactTableType, IFactTable } from './fact-table-config-schema';

export class FactTable implements IFactTable {
  public readonly linkedDimensions: Map<string, Dimension> = new Map();
  constructor(
    public readonly id: string,
    public readonly type: FactTableType,
    public readonly sharding: string[],
    public readonly storage: { type: FactTableStorageType; pattern: string },
    public readonly columns: any[],
  ) {}

  log() {
    console.log(`Fact table: ${this.id}`);
    console.table(
      this.columns.map((c) => ({
        id: c.id,
        type: c.type,
        label: c.label,
        unit: c.unit,
        aggregationMethod: c.aggregationMethod,
      })),
    );
  }
}
