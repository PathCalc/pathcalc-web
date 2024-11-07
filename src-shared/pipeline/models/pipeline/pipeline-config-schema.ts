import { z } from 'zod';

import { opSchema } from '../transforms/transforms';

export const pipelineStepTypeSchema = z.string();
export type PipelineStepType = z.infer<typeof pipelineStepTypeSchema>;

export const pipelineStepConfigSchema = opSchema;
export type PipelineStepConfig = z.infer<typeof pipelineStepConfigSchema>;

export const pipelineFlowConfigSchema = z.array(pipelineStepConfigSchema);
export type PipelineFlowConfig = z.infer<typeof pipelineFlowConfigSchema>;

export const pipelineConfigSchema = z.object({
  sharding: z.array(z.string()),
  flows: z.array(pipelineFlowConfigSchema),
});

export type PipelineConfig = z.infer<typeof pipelineConfigSchema>;
