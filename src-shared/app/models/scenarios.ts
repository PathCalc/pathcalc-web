import { z } from 'zod';

export const leverConfigSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string(),
  values: z.object({
    min: z.number(),
    max: z.number(),
  }),
});

export type LeverConfig = z.infer<typeof leverConfigSchema>;

export const presetConfigSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string(),
  scenario: z.record(z.number()),
});

export type PresetConfig = z.infer<typeof presetConfigSchema>;

export const scenariosConfigSchema = z
  .object({
    levers: z.array(leverConfigSchema).describe('List of levers presented in the app.'),
    presets: z.array(presetConfigSchema).describe('List of example scenario presets that the user can pick from.'),
  })
  .describe('Scenario-related app configuration.');
