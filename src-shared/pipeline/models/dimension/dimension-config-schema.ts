import { z } from 'zod';

export const dimensionValueConfigSchema = z.object({
  id: z.string(),
  label: z.string().optional(),
  color: z.string().optional(),
});

export type DimensionValueConfig = z.infer<typeof dimensionValueConfigSchema>;

export const dimensionContentConfigSchema = z.array(dimensionValueConfigSchema);

export type DimensionContentConfig = z.infer<typeof dimensionContentConfigSchema>;

export const dimensionConfigSchema = z.object({
  id: z.string(),
  label: z.string().optional(),
  content: z.string().or(dimensionContentConfigSchema),
});

export type DimensionConfig = z.infer<typeof dimensionConfigSchema>;
