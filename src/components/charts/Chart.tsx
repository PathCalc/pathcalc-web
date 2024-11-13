import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import { AxisDomain } from 'recharts/types/util/types';

import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

export function Chart({
  type,
  stacked,
  chartConfig,
  data,
  xVariable,
  series,
  visibleSeries = series.map((s) => s.dataKey),
  yVariable,
  yRange,
  yLabel,
  tooltip = true,
  legend,
  //
  seriesShapeProps = {},
  chartProps = {},
  chartComponentProps: {
    CartesianGrid: cg = {},
    XAxis: xa = {},
    YAxis: ya = {},
    ChartTooltip: ct = {},
    ChartTooltipContent: ctc = {},
    ChartLegend: cl = {},
    ChartLegendContent: clc = {},
  } = {},
}: {
  data: any[];
  xVariable: string;
  yVariable: string;
  series: { dataKey: string | number; color: string }[];
  visibleSeries?: (string | number)[];
  //
  type: 'line' | 'area' | 'bar';
  stacked: boolean;
  chartConfig: ChartConfig;
  yRange?: AxisDomain;
  yLabel?: string;
  tooltip?: boolean;
  legend?: boolean | 'bottom' | 'right';
  //
  seriesShapeProps?: Record<string, unknown>;
  chartProps?: Record<string, unknown>;
  chartComponentProps?: Record<string, any>;
}) {
  const ShapeChart = getShapeChart(type);
  const Shape = getShape(type);

  if (legend === true || legend == null) {
    legend = 'right';
  }

  const is100PercentStacked = stacked && chartProps.stackOffset === 'expand';

  const tooltipNodes = tooltip ? (
    <ChartTooltip
      content={
        <ChartTooltipContent
          labelKey={yVariable}
          labelFormatter={(label, payload) => {
            return `${label} - ${payload[0].payload[xVariable]}`;
          }}
          valueFormatter={(v) => v.toLocaleString('en-GB', { maximumSignificantDigits: 3 })}
          {...ctc}
        />
      }
      // cursorStyle={{
      //   fillOpacity: 0.5,
      //   opacity: 0.1,
      // }}
      allowEscapeViewBox={{ x: true }}
      wrapperStyle={{ zIndex: 1000 }}
      {...ct}
    />
  ) : null;

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <ShapeChart accessibilityLayer data={data} {...chartProps}>
        <CartesianGrid vertical={false} {...cg} />
        <XAxis dataKey={xVariable} tickLine={false} tickMargin={10} axisLine={false} {...xa} />
        <YAxis
          domain={is100PercentStacked ? undefined : yRange}
          label={{
            value: yLabel,
            position: 'insideTopLeft',
            offset: 10,
          }}
          {...ya}
          tickFormatter={(tick: number) =>
            tick.toLocaleString('en-GB', {
              maximumSignificantDigits: 3,
            })
          }
        />
        {type === 'bar' && tooltipNodes}
        {series.map((s) => {
          const visible = visibleSeries.includes(s.dataKey);
          return (
            <Shape
              key={s.dataKey}
              dataKey={s.dataKey}
              fill={s.color}
              fillOpacity={1}
              stroke={s.color}
              hide={!visible}
              legendType={visible ? undefined : 'none'}
              stackId={stacked ? 'a' : undefined}
              dot={false}
              activeDot={false}
              //
              {...seriesShapeProps}
            />
          );
        })}

        {type !== 'bar' && tooltipNodes}
        {legend !== false && (
          <ChartLegend
            content={<ChartLegendContent {...clc} />}
            {...(legend === 'bottom'
              ? { layout: 'horizontal', align: 'center', verticalAlign: 'top' }
              : {
                  layout: 'vertical',
                  align: 'right',
                  verticalAlign: 'middle',
                })}
            {...cl}
          />
        )}
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
