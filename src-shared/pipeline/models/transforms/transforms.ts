import { z } from 'zod';

export const dimensionPathSchema = z.string().regex(/^[a-zA-Z0-9]+(:[a-zA-Z0-9]+)*$/);

export const opLoadSchema = z.object({
  $: z.literal('load'),
  from: z.string(),
  sharding: z.array(z.string()),
});

export const opLoadTempSchema = z.object({
  $: z.literal('load-temp'),
  from: z.string().regex(/^#/),
});

export const opSaveSchema = z.object({
  $: z.literal('save'),
  to: z.string(),
  sharding: z.array(z.string()),
});

export const opSaveTempSchema = z.object({
  $: z.literal('save-temp'),
  to: z.string().regex(/^#/),
});

export const opAggregateSchema = z.object({
  $: z.literal('aggregate'),
  groupby: z.array(dimensionPathSchema),
});

export const opFilterSchema = z.object({
  $: z.literal('filter'),
  column: dimensionPathSchema,
  in: z.array(z.string()),
});

export const opDotSchema = z.object({
  $: z.literal('.'),
});

export const opSchema = z.discriminatedUnion('$', [
  opLoadSchema,
  // opLoadTempSchema,
  opSaveSchema,
  // opSaveTempSchema,
  opAggregateSchema,
  opFilterSchema,
  opDotSchema,
]);
