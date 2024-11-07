import { PipelineStepConfig } from '../models/pipeline/pipeline-config-schema';
import { AggregateStep } from './p0/aggregate-step';
import { FilterStep } from './p0/filter-step';
import { LoadStep } from './p0/load-step';
import { SaveStep } from './p0/save-step';

export function createStep(config: PipelineStepConfig) {
  switch (config.$) {
    case 'load':
      return new LoadStep(config);
    case 'aggregate':
      return new AggregateStep(config);
    case 'filter':
      return new FilterStep(config);
    case 'save':
      return new SaveStep(config);
    default:
      throw new Error(`Unknown step type: ${config.$}`);
  }
}
