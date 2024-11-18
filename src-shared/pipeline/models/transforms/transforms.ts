import { z } from 'zod';

import { opAggregateSchema } from '~shared/pipeline/transforms/p0/aggregate-step';
import { opFilterSchema } from '~shared/pipeline/transforms/p0/filter-step';
import { opLoadSchema } from '~shared/pipeline/transforms/p0/load-step';
import { opSaveSchema } from '~shared/pipeline/transforms/p0/save-step';

// export const opLoadTempSchema = z.object({
//   $: z.literal('load-temp'),
//   from: z.string().regex(/^#/),
// });

// export const opSaveTempSchema = z.object({
//   $: z.literal('save-temp'),
//   to: z.string().regex(/^#/),
// });

// export const opAggregateSchema = z.object({
//   $: z.literal('aggregate'),
//   groupby: z.array(dimensionPathSchema),
// });

// export const opFilterSchema = z.object({
//   $: z.literal('filter'),
//   column: dimensionPathSchema,
//   in: z.array(z.string()),
// });

// export const opDotSchema = z.object({
//   $: z.literal('.'),
// });

export const opSchema = z.discriminatedUnion('$', [
  opLoadSchema,
  // opLoadTempSchema,
  opSaveSchema,
  // opSaveTempSchema,
  opAggregateSchema,
  opFilterSchema,
  // opDotSchema,
]);
