import { z } from 'zod';

import { dimensionIdSchema } from '../dimension/dimension-config-schema';

export const factTableConfigColumnSchema = z.discriminatedUnion('type', [
  z
    .object({
      id: z.string(),
      type: z.literal('dimension'),
    })
    .strict(),
  z
    .object({
      id: z.string(),
      type: z.literal('measure'),
      label: z.string().optional(),
      unit: z.string().optional(),
      aggregationMethod: z.enum(['sum']).optional(),
    })
    .strict(),
]);

export type FactTableConfigColumn = z.infer<typeof factTableConfigColumnSchema>;

export const factTableConfigTypeSchema = z.enum(['raw', 'web']);
export type FactTableType = z.infer<typeof factTableConfigTypeSchema>;

export const factTableConfigStorageTypeSchema = z.enum(['local-input', 'local-public']);
export type FactTableStorageType = z.infer<typeof factTableConfigStorageTypeSchema>;

export const factTableConfigSchema = z.object({
  id: z.string(),
  type: factTableConfigTypeSchema,
  sharding: z.array(dimensionIdSchema).max(1),
  storage: z.object({
    type: factTableConfigStorageTypeSchema,
    pattern: z.string(),
  }),
  columns: z.array(factTableConfigColumnSchema),
});

export type FactTableConfig = z.infer<typeof factTableConfigSchema>;

export type IFactTable = FactTableConfig;
