import { z } from 'zod';

import { dimensionIdSchema } from '../dimension/dimension-config-schema';

export const measureTypeColumnSchema = z.object({
  name: z.string(),
  type: z.literal('measure'),
  label: z.string().optional(),
  // unit: z.string().optional(),
  aggregationMethod: z.enum(['sum']).optional(),
});

export type MeasureColumnConfig = z.infer<typeof measureTypeColumnSchema>;

export const dimensionTypeColumnSchema = z.object({
  name: z.string(),
  type: z.literal('dimension'),
});

export type DimensionColumnConfig = z.infer<typeof dimensionTypeColumnSchema>;

export const factTableConfigColumnSchema = z.discriminatedUnion('type', [
  dimensionTypeColumnSchema.strict(),
  measureTypeColumnSchema.strict(),
]);

export type FactTableConfigColumn = z.infer<typeof factTableConfigColumnSchema>;

export const factTableConfigTypeSchema = z.enum(['raw', 'web']);
export type FactTableType = z.infer<typeof factTableConfigTypeSchema>;

export const factTableConfigStorageTypeSchema = z.enum(['local-input', 'local-public']);
export type FactTableStorageType = z.infer<typeof factTableConfigStorageTypeSchema>;

export const factTableConfigSchema = z.discriminatedUnion('type', [
  z
    .object({
      type: z.literal('raw'),
      id: z.string(),
      sharding: z.array(dimensionIdSchema).max(1),
      storage: z.object({
        type: factTableConfigStorageTypeSchema,
        pattern: z.string(),
      }),
      columns: z.array(factTableConfigColumnSchema),
    })
    .strict(),
  z
    .object({
      type: z.literal('web'),
      id: z.string(),
      sharding: z.array(dimensionIdSchema).max(1),
      storage: z.object({
        type: factTableConfigStorageTypeSchema,
        pattern: z.string(),
      }),
      columns: z.array(factTableConfigColumnSchema).optional(),
    })
    .strict(),
]);

export type FactTableConfig = z.infer<typeof factTableConfigSchema>;
