import { z } from 'zod';

export const pipelineStepTypeSchema = z.string();
export type PipelineStepType = z.infer<typeof pipelineStepTypeSchema>;

export const pipelineStepConfigSchema = z
  .object({
    $: pipelineStepTypeSchema,
  })
  .passthrough();
export type PipelineStepConfig = z.infer<typeof pipelineStepConfigSchema>;

export const pipelineFlowConfigSchema = z.array(pipelineStepConfigSchema);
export type PipelineFlowConfig = z.infer<typeof pipelineFlowConfigSchema>;

export const pipelineConfigSchema = z.array(pipelineFlowConfigSchema);
export type PipelineConfig = z.infer<typeof pipelineConfigSchema>;
