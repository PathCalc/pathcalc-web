import { Merge } from 'type-fest';
import { z } from 'zod';

const DIMENSION_ID_RE = /^[a-zA-Z][a-zA-Z0-9_ ]*$/;

export const dimensionIdSchema = z
  .string()
  .regex(DIMENSION_ID_RE)
  .describe(
    'Dimension unique identifier. Identifiers can contain letters, numbers, underscore, or spaces, but must start with a letter.',
  );

export const dimensionValueConfigSchema = z
  .object({
    id: z.string().describe('Unique identifier for the value. Needs to be unique within the domain.'),
    label: z.string().optional().nullable().describe('Human-readable label for the value.'),
    color: z.string().optional().nullable().describe('Color to be used to display this value in charts.'),
  })
  .passthrough()
  .describe('Single element of a domain.');

export type DimensionValueConfig = z.infer<typeof dimensionValueConfigSchema>;

export const dimensionDomainConfigSchema = z
  .array(dimensionValueConfigSchema)
  .min(1)
  .describe('List of domain values.');

export type DimensionDomainConfig = z.infer<typeof dimensionDomainConfigSchema>;

export const dimensionConfigBaseSchema = z.object({
  id: dimensionIdSchema,
  label: z.string().optional().describe('Human-readable label for the dimension.'),
});

export const dimensionConfigSingleFileSchema = dimensionConfigBaseSchema
  .merge(
    z.object({
      domain: dimensionDomainConfigSchema,
    }),
  )
  .strict();

export const dimensionConfigSplitFileSchema = dimensionConfigBaseSchema
  .strict()
  .describe('Dimension configuration metadata file (requires and accompanying CSV file)');

export type DimensionConfig = z.infer<typeof dimensionConfigSingleFileSchema>;

export type IDimension = Merge<
  DimensionConfig,
  {
    domain: DimensionDomainConfig;
  }
>;
