import { z } from 'zod';

import { ChartBlockConfig, chartBlockConfigSchema } from './chart-block';

// export const someBlockConfigSchema = z
//   .object({
//     type: z.string(),
//   })
//   .passthrough();

// export type SomeBlockConfig = z.infer<typeof someBlockConfigSchema>;

export const textBlockConfigSchema = z.object({
  type: z.literal('text').describe('text: a block for displaying text content'),
  content: z
    .string()
    .describe(
      'The text content to be displayed. Supports Markdown format, but line breaks need to be indicated as \\n',
    ),
});

export type TextBlockConfig = z.infer<typeof textBlockConfigSchema>;

export const placeholderBlockConfigSchema = z.object({
  type: z.literal('placeholder').describe('placeholder: a block for taking up space in a layout, like a chart'),
});

export type PlaceholderBlockConfig = z.infer<typeof placeholderBlockConfigSchema>;

export const primitiveBlockConfigSchema = z.discriminatedUnion('type', [
  textBlockConfigSchema,
  chartBlockConfigSchema,
  placeholderBlockConfigSchema,
]);

export const anyBlockConfigSchema: z.ZodType<
  RowBlockConfig | TextBlockConfig | ChartBlockConfig | PlaceholderBlockConfig
> = z.lazy(() =>
  z.discriminatedUnion('type', [
    rowBlockConfigSchema,
    textBlockConfigSchema,
    chartBlockConfigSchema,
    placeholderBlockConfigSchema,
  ]),
);

export const rowBlockConfigSchema = z.object({
  type: z.literal('row').describe('row: a block for holding a list of other blocks in a horizontal layout'),
  title: z.string().optional().describe('Title to display for the row (optional)'),
  items: z.array(primitiveBlockConfigSchema).describe('List of blocks to be rendered in a horizontal layout'),
});

export type RowBlockConfig = z.infer<typeof rowBlockConfigSchema>;

export const containerBlockConfigSchema = z.object({
  type: z.literal('container').describe('container: a block for holding a list of other blocks in a vertical layout'),
  items: z.array(anyBlockConfigSchema).describe('List of blocks to be rendered in a vertical layout'),
});

export type ContainerBlockConfig = z.infer<typeof containerBlockConfigSchema>;
