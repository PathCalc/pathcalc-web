import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, Line, LineChart, XAxis, YAxis } from 'recharts';
import { AxisDomain } from 'recharts/types/util/types';

import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

export function Chart({
  type,
  stacked,
  chartConfig,
  data,
  XVariable,
  series,
  seriesShapeProps = {},
  YVariable,
  YRange,
}: {
  type: 'line' | 'area' | 'bar';
  stacked: boolean;
  chartConfig: ChartConfig;
  data: any[];
  XVariable: string;
  series: { dataKey: string | number; color: string }[];
  seriesShapeProps?: Record<string, unknown>;
  YVariable: string;
  YRange: AxisDomain;
}) {
  const ShapeChart = getShapeChart(type);
  const Shape = getShape(type);

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <ShapeChart accessibilityLayer data={data}>
        <CartesianGrid />
        <XAxis dataKey={XVariable} tickLine={false} tickMargin={10} axisLine={false} />
        <YAxis domain={YRange} />
        {series.map((s) => (
          <Shape
            key={s.dataKey}
            dataKey={s.dataKey}
            fill={s.color}
            stroke={s.color}
            {...(stacked ? { stackId: 'a' } : {})}
            //
            {...seriesShapeProps}
            //
          />
        ))}
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
        <Legend />
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
