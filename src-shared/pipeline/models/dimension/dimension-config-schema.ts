import { Merge } from 'type-fest';
import { z } from 'zod';

export const dimensionIdSchema = z.string().regex(/^[a-zA-Z][a-zA-Z0-9_]*$/);

export const dimensionValueConfigSchema = z
  .object({
    id: z.string(),
    label: z.string().optional().nullable(),
    color: z.string().optional().nullable(),
  })
  .passthrough();

export type DimensionValueConfig = z.infer<typeof dimensionValueConfigSchema>;

export const dimensionDomainConfigSchema = z.array(dimensionValueConfigSchema).min(1);

export type DimensionDomainConfig = z.infer<typeof dimensionDomainConfigSchema>;

export const dimensionConfigBaseSchema = z.object({
  id: dimensionIdSchema,
  label: z.string().optional(),
});

export const dimensionConfigSingleFileSchema = dimensionConfigBaseSchema
  .merge(
    z.object({
      domain: dimensionDomainConfigSchema,
    }),
  )
  .strict();

export const dimensionConfigSplitFileSchema = dimensionConfigBaseSchema.strict();

export type DimensionConfig = z.infer<typeof dimensionConfigSingleFileSchema>;

export type IDimension = Merge<
  DimensionConfig,
  {
    domain: DimensionDomainConfig;
  }
>;
