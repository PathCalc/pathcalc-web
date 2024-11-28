import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  Line,
  LineChart,
  ReferenceLine,
  XAxis,
  YAxis,
} from 'recharts';
import { AxisDomain } from 'recharts/types/util/types';

import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { useBreakpoint } from '@/lib/hooks/tailwind';

const defaultSeriesShapeProps = {
  area: {
    stroke: '#000',
  },
  line: {
    strokeWidth: 2,
  },
  bar: {
    stroke: '#000',
    barSize: 70,
  },
};

const defaultNumberFormatting = {
  maximumSignificantDigits: 3,
};

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
  yUnit,
  tooltip = true,
  legend,
  numberFormat = defaultNumberFormatting,
  axisNumberFormat = defaultNumberFormatting,
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
  yUnit?: string;
  tooltip?: boolean;
  legend?: boolean | 'bottom' | 'right';
  numberFormat?: Intl.NumberFormatOptions;
  axisNumberFormat?: Intl.NumberFormatOptions;
  //
  seriesShapeProps?: Record<string, unknown>;
  chartProps?: Record<string, unknown>;
  chartComponentProps?: Record<string, any>;
}) {
  const isDesktop = useBreakpoint('md');

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
            return `${label == null ? '' : `${label} - `}${payload[0].payload[xVariable]}`;
          }}
          valueFormatter={(v) => v.toLocaleString('en-GB', numberFormat)}
          visibleItems={visibleSeries}
          {...ctc}
        />
      }
      allowEscapeViewBox={{ x: isDesktop }}
      wrapperStyle={{ zIndex: 40 }}
      {...ct}
    />
  ) : null;

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <ShapeChart accessibilityLayer data={data} margin={{ top: 20 }} {...chartProps}>
        <CartesianGrid vertical={false} {...cg} />
        <XAxis dataKey={xVariable} tickLine={true} tickMargin={10} axisLine={true} {...xa} />
        <YAxis
          domain={is100PercentStacked ? undefined : yRange}
          label={<Label position="top" offset={10} value={yUnit} textAnchor="start" />}
          {...ya}
          tickFormatter={(tick: number) => tick.toLocaleString('en-GB', axisNumberFormat)}
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
              hide={stacked ? false : !visible}
              legendType={visible ? undefined : 'none'}
              stackId={stacked ? 'a' : undefined}
              dot={false}
              activeDot={false}
              //
              {...defaultSeriesShapeProps[type]}
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
                  width: 100,
                })}
            {...cl}
          />
        )}
        <ReferenceLine y={0} stroke="#aaa" strokeWidth={1} />
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
