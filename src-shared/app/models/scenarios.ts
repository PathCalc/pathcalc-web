import { z } from 'zod';

export const leverConfigSchema = z.object({
  id: z
    .string()
    .describe('Unique identifier of the lever. Will appear in the URL - should be a lower-case text without spaces.'),
  label: z.string().describe('Human-readable name of the lever.'),
  description: z
    .string()
    .describe(
      'Description of the lever, explaining what it does. Will appear in the information tooltip. Supports Markdown format (URLs etc).',
    ),
  values: z
    .object({
      min: z.number().describe('Minimum value that the lever can take.'),
      max: z.number().describe('Maximum value that the lever can take.'),
    })
    .describe('Range of values that the lever can take.'),
  valueDescriptions: z
    .record(z.string().regex(/^\d+$/), z.string())
    .optional()
    .describe(
      'Descriptions of the values. Keys should match lever values, e.g. "1", "2" etc. Values should be the text to display in the slider tooltip. Supports Markdown formatting.',
    ),
});

export type LeverConfig = z.infer<typeof leverConfigSchema>;

export const presetConfigSchema = z.object({
  id: z.string().describe('Unique identifier of the preset. Should be a text without spaces.'),
  label: z.string().describe('Human-readable name of the preset. Will appear in the dropdown list.'),
  description: z.string().describe('Description of the preset, explaining what it does. Currently not used.'),
  scenario: z
    .record(z.number())
    .describe(
      'Values of the levers in the preset. Keys should match the lever IDs. Values should be numbers within the lever range.',
    ),
});

export type PresetConfig = z.infer<typeof presetConfigSchema>;

export const scenariosConfigSchema = z
  .object({
    levers: z.array(leverConfigSchema).describe('List of levers presented in the app.'),
    presets: z.array(presetConfigSchema).describe('List of example scenario presets that the user can pick from.'),
  })
  .describe('Scenario-related app configuration.');
