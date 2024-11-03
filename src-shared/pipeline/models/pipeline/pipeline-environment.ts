import { Dimension } from '../dimension/dimension';
import { FactTable } from '../fact-table/fact-table';

export type ExecutionEnvironment = 'server' | 'browser';

export class PipelineEnvironment {
  constructor(
    public readonly executionEnvironment: ExecutionEnvironment,
    public dimensions: Map<string, Dimension>,
    public factTables: Map<string, FactTable>,
  ) {}
}
