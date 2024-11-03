import { PipelineStepConfig } from './pipeline-config-schema';

export class PipelineStep {
  constructor(public config: PipelineStepConfig) {}
}
