import { z } from 'zod';

import { containerBlockConfigSchema } from './page-blocks/layout-blocks';

export const singleChartPageConfigSchema = z
  .object({
    content: containerBlockConfigSchema.describe(
      'Configuration of the page content (must be a container block definition).',
    ),
  })
  .describe('Chart page configuration');

export type SingleChartPageConfig = z.infer<typeof singleChartPageConfigSchema>;
