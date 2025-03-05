import { z } from 'zod';

import { chartTypeSchema } from './page-blocks/chart-block';

export const defaultChartSettingsSchema = z
  .object({
    numberFormat: z
      .object({})
      .passthrough()
      .describe(
        'Default number format for the app, following the Intl.NumberFormat options.\nSee https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat#options.',
      ),
    seriesShapeProps: z
      .record(chartTypeSchema, z.object({}).passthrough())
      .describe(
        'Default chart series shape properties for each chart type. See docs:' +
          '\narea: https://recharts.org/en-US/api/Area' +
          '\nbar: https://recharts.org/en-US/api/Bar' +
          '\nline: https://recharts.org/en-US/api/Line',
      ),
  })
  .describe('Default settings to apply to all charts.');

export type DefaultChartSettings = z.infer<typeof defaultChartSettingsSchema>;

export const generalConfigSchema = z
  .object({
    logo: z
      .object({
        title: z.string().describe('Primary part of the logotype - displayed in bold'),
        subtitle: z.string().describe('Secondary part of the logotype - displayed in a lighter font'),
      })
      .describe('Logotype configuration for the app.'),
    title: z.string().describe('Title of the app. Displayed in browser tab title.'),
    description: z.string().describe('Description of the app. Displayed in social media previews etc.'),
    defaultChartSettings: defaultChartSettingsSchema,
  })
  .describe('General configuration for the app.');

export type GeneralConfig = z.infer<typeof generalConfigSchema>;
