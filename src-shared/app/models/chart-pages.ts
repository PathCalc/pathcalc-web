import { z } from 'zod';

export const chartPagesConfigSchema = z.object({
  config: z
    .array(
      z.object({
        title: z.string().describe('Title of the page'),
        slug: z
          .string()
          .regex(/^[a-z0-9-]+$/)
          .describe(
            '"Slug" of the page. Consists of lower-case letters, numbers, or dashes. This is used in the URL to identify the chart page. Needs to match a file under public/config/pages/[slug].json',
          ),
      }),
    )
    .describe('List of chart pages to list in the app header.'),
});
