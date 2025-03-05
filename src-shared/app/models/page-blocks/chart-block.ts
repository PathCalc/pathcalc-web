import { z } from 'zod';

export const chartTypeSchema = z.enum(['line', 'bar', 'area']).describe('Chart type (line/bar/area)');

export const numberFormatSchema = z.object({}).passthrough();

export const chartBlockConfigSchema = z.object({
  type: z
    .literal('chart')
    .describe('chart: a block for displaying an interactive chart linked to data coming from the pipeline.'),
  title: z.string().optional().describe('Title to display above the chart.'),
  dataset: z
    .string()
    .describe('ID of fact table to load the dataset from. Needs to match one of the existing fact tables of type: web'),
  x: z.string().describe("Name of dataset column to use for the chart's X axis."),
  y: z.string().describe("Name of  dataset column to use for the chart's Y axis."),
  series: z.string().describe("Name of dataset column to use for the chart's series."),
  options: z
    .object({
      type: chartTypeSchema,
      stacked: z.boolean().optional().describe('Should the chart shapes be stacked (true/false)'),
      yLabel: z
        .string()
        .optional()
        .describe('Label for the Y axis. Will be displayed near the axis, and in the tooltips.'),
      yUnit: z.string().optional().describe('Unit for the Y axis. Will be displayed in the tooltips.'),
      legend: z
        .boolean()
        .or(z.enum(['bottom', 'right']))
        .optional()
        .describe(
          'Customise the displaying of the legend. true/false to show/hide, or "bottom"/"right" to show at precise position.',
        ),
      numberFormat: numberFormatSchema
        .optional()
        .describe(
          'Number formatting options as defined in the Intl.NumberFormat options format: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat#options',
        ),
      axisNumberFormat: numberFormatSchema
        .optional()
        .describe(
          'Number formatting options for axis ticks.\nAs defined in the Intl.NumberFormat options format: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat#options.\nIf not set, will use numberFormat.',
        ),
      emptyIsZero: z.boolean().optional().describe('Should empty values be treated as 0 (true/false). Default: true'),
      showEmptySeries: z
        .boolean()
        .optional()
        .describe('Should empty series be shown in legend (true/false). Default: false'),
      showTooltipTotal: z
        .boolean()
        .optional()
        .describe('Should the total be shown in the tooltip (true/false). Default: true'),
      extraProps: z
        .object({
          chart: z
            .object({})
            .passthrough()
            .optional()
            .describe(
              'Options to pass to the main chart component. Depending on chart type, see docs:' +
                '\narea: https://recharts.org/en-US/api/AreaChart' +
                '\nbar: https://recharts.org/en-US/api/BarChart' +
                '\nline: https://recharts.org/en-US/api/LineChart',
            ),
          chartSeries: z
            .object({})
            .passthrough()
            .optional()
            .describe(
              'Options to pass to the individual chart series components. Depending on chart type, see docs:' +
                '\narea: https://recharts.org/en-US/api/Area' +
                '\nbar: https://recharts.org/en-US/api/Bar' +
                '\nline: https://recharts.org/en-US/api/Line',
            ),
          chartComponents: z
            .object({
              CartesianGrid: z
                .object({})
                .passthrough()
                .optional()
                .describe('See docs: https://recharts.org/en-US/api/CartesianGrid'),
              XAxis: z.object({}).passthrough().optional().describe('See docs: https://recharts.org/en-US/api/XAxis'),
              YAxis: z.object({}).passthrough().optional().describe('See docs: https://recharts.org/en-US/api/YAxis'),
              Legend: z.object({}).passthrough().optional().describe('See docs: https://recharts.org/en-US/api/Legend'),
              ChartTooltip: z
                .object({})
                .passthrough()
                .optional()
                .describe('See docs: https://recharts.org/en-US/api/Tooltip'),
              ChartLegend: z
                .object({})
                .passthrough()
                .optional()
                .describe('See docs: https://recharts.org/en-US/api/Legend'),
            })
            .passthrough()
            .optional()
            .describe(
              'Options to pass to individual components of the chart layout such the axes, tooltip, legend etc.',
            ),
        })
        .optional()
        .describe(
          'Extra properties to customize the chart display/behavior.\nProperties are passed directly to the chart library (Recharts) and therefore expose the whole functionality of that library.\nSee documentation at https://recharts.org/en-US/api',
        ),
    })
    .describe('Options to customize the chart display.'),
});

export type ChartBlockConfig = z.infer<typeof chartBlockConfigSchema>;
