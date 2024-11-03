import { FactTable } from './fact-table';

export function reportFactTables(factTables: FactTable[]) {
  factTables.forEach((f) => f.log());
}
