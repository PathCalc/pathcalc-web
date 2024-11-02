import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, Line, LineChart, XAxis, YAxis } from 'recharts';
import { AxisDomain } from 'recharts/types/util/types';

import {
  ChartConfig,
  ChartContainer,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

export function Chart({
  type,
  stacked,
  chartConfig,
  data,
  XVariable,
  series,
  visibleSeries = series.map((s) => s.dataKey),
  seriesShapeProps = {},
  chartProps = {},
  YVariable,
  YRange,
}: {
  type: 'line' | 'area' | 'bar';
  stacked: boolean;
  chartConfig: ChartConfig;
  data: any[];
  XVariable: string;
  series: { dataKey: string | number; color: string }[];
  visibleSeries?: (string | number)[];
  seriesShapeProps?: Record<string, unknown>;
  chartProps?: Record<string, unknown>;
  YVariable: string;
  YRange?: AxisDomain;
}) {
  const ShapeChart = getShapeChart(type);
  const Shape = getShape(type);

  const is100PercentStacked = stacked && chartProps.stackOffset === 'expand';

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <ShapeChart accessibilityLayer data={data} {...chartProps}>
        <CartesianGrid />
        <XAxis dataKey={XVariable} tickLine={false} tickMargin={10} axisLine={false} />
        <YAxis domain={is100PercentStacked ? undefined : YRange} />
        {series.map((s) => {
          const visible = visibleSeries.includes(s.dataKey);
          return (
            <Shape
              key={s.dataKey}
              dataKey={s.dataKey}
              fill={s.color}
              stroke={s.color}
              hide={!visible}
              legendType={visible ? undefined : 'none'}
              stackId={stacked ? 'a' : undefined}
              // {...(stacked ? { stackId: 'a' } : {})}
              //
              {...seriesShapeProps}
              //
            />
          );
        })}
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelKey={YVariable}
              labelFormatter={(label, payload) => {
                return `${label} - ${payload[0].payload[XVariable]}`;
              }}
            />
          }
          cursorStyle={{
            fillOpacity: 0.5,
            opacity: 0.1,
          }}
        />
        <Legend content={<ChartLegendContent />} />
      </ShapeChart>
    </ChartContainer>
  );
}

function getShapeChart(type: 'line' | 'area' | 'bar') {
  switch (type) {
    case 'line':
      return LineChart;
    case 'area':
      return AreaChart;
    case 'bar':
      return BarChart;
  }
  throw new Error('Invalid chart type');
}

function getShape(type: 'line' | 'area' | 'bar'): any {
  switch (type) {
    case 'line':
      return Line;
    case 'area':
      return Area;
    case 'bar':
      return Bar;
  }
  throw new Error('Invalid chart type');
}
