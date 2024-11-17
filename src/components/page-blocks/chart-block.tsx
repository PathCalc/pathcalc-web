import { Suspense, useDeferredValue } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { z } from 'zod';

import { useScenario } from '@/state/scenario';

import { ChartDataAdapter } from '../charts/ChartDataAdapter';
import { ErrorFallback } from '../react/ErrorFallback';

export const chartTypeSchema = z.enum(['line', 'bar', 'area']);

export const chartBlockConfigSchema = z.object({
  type: z.literal('chart'),
  title: z.string().optional(),
  dataset: z.string().describe('The '),
  x: z.string(),
  y: z.string(),
  series: z.string(),
  options: z.object({
    type: chartTypeSchema,
    stacked: z.boolean().optional(),
    legend: z
      .boolean()
      .or(z.enum(['bottom', 'right']))
      .optional(),
    emptyIsZero: z.boolean().optional(),
    showEmptySeries: z.boolean().optional(),
    extraProps: z
      .object({
        chart: z.object({}).passthrough().optional(),
        chartSeries: z.object({}).passthrough().optional(),
        chartComponents: z
          .object({
            CartesianGrid: z.object({}).passthrough().optional(),
            XAxis: z.object({}).passthrough().optional(),
            YAxis: z.object({}).passthrough().optional(),
            Legend: z.object({}).passthrough().optional(),
            ChartTooltip: z.object({}).passthrough().optional(),
            ChartTooltipContent: z.object({}).passthrough().optional(),
            ChartLegend: z.object({}).passthrough().optional(),
            ChartLegendContent: z.object({}).passthrough().optional(),
          })
          .passthrough()
          .optional(),
      })
      .optional(),
  }),
});

export type ChartBlockConfig = z.infer<typeof chartBlockConfigSchema>;

export type ChartBlockProps = Omit<ChartBlockConfig, 'type'>;

export const ChartBlock = ({ title, ...props }: ChartBlockProps) => {
  const scenario = useScenario();
  const deferredScenario = useDeferredValue(scenario);
  return (
    <div className="grow w-full min-h-[300px] h-[300px] max-h-[300px] flex flex-col items-stretch justify-start">
      <div>{title != null ? <h3 className="inline-block">{title}</h3> : null}</div>
      <ErrorBoundary fallback={<ErrorFallback message="Something went wrong while displaying this chart." />}>
        <Suspense fallback={null}>
          <ChartDataAdapter scenario={deferredScenario} {...props} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};
