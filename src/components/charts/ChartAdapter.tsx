import { ColumnTable, escape, from } from 'arquero';
import { schemeTableau10 } from 'd3-scale-chromatic';
import { indexBy } from 'remeda';

import { ChartStat } from '~shared/pipeline/models/dataset/types';
import { ChartStatDefinition, isChartStatDefinitionEqual } from '~shared/pipeline/models/stats';
import { d3 } from '@/lib/d3';
import { orderByList } from '@/lib/data-utils';

import { Chart } from './Chart';

type ChartDimensionValue = {
  value: string | number;
  label?: string;
  color?: string;
};

export type ChartDimensionColumn = {
  type: 'dimension';
  id: string;
  label: string;
  values: ChartDimensionValue[];
};

export type ChartMeasureColumn = {
  type: 'measure';
  id: string;
  label: string;
  stats?: ChartStat[];
};

export type ChartAdapterColumns = (ChartDimensionColumn | ChartMeasureColumn)[];

export function ChartAdapter({
  //
  table,
  xColumn,
  yColumn,
  seriesColumn,
  sharding,
  //
  type,
  stacked = false,
  //
  legend,
  yLabel,
  yUnit,
  numberFormat,
  axisNumberFormat,
  emptyIsZero = true,
  showEmptySeries = false,
  //
  seriesShapeProps = {},
  chartProps = {},
  chartComponentProps = {},
}: {
  /** Dataset table */
  table: ColumnTable;
  xColumn: ChartDimensionColumn;
  yColumn: ChartMeasureColumn;
  seriesColumn: ChartDimensionColumn;
  sharding: string[];
  //
  type: 'line' | 'area' | 'bar';
  stacked?: boolean;
  legend?: boolean | 'bottom' | 'right';
  yLabel?: string;
  yUnit?: string;
  numberFormat?: Intl.NumberFormatOptions;
  axisNumberFormat?: Intl.NumberFormatOptions;
  emptyIsZero?: boolean;
  showEmptySeries?: boolean;
  //
  /** Properties that will be passed to each of the series shapes */
  seriesShapeProps?: Record<string, unknown>;
  /** Properties that will be passed to the main chart component */
  chartProps?: Record<string, unknown>;
  chartComponentProps?: Record<string, unknown>;
}) {
  const seriesColors = prepareSeriesColors(seriesColumn.values);

  const allSeries = seriesColumn.values;
  const visibleSeries = prepareVisibleSeries(table, seriesColumn, showEmptySeries);

  const dataGrid = prepareDataGrid(xColumn, seriesColumn);

  const chartData = prepareChartData(
    dataGrid,
    table,
    emptyIsZero,
    xColumn.id,
    xColumn.values,
    yColumn.id,
    seriesColumn.id,
    allSeries,
  );
  const chartConfig = prepareChartConfig(xColumn, yColumn, allSeries, seriesColors, yLabel, yUnit);
  const chartSeries = prepareChartSeries(allSeries, seriesColors);

  const statDefinition: ChartStatDefinition = {
    crossSectionType: type === 'line' ? 'point' : 'line',
    stacked,
    grouping: [xColumn.id, ...sharding],
  };
  const yRange = prepareYRange(yColumn, statDefinition);

  return (
    <Chart
      data={chartData}
      series={chartSeries}
      xVariable={xColumn.id}
      yVariable={yColumn.id}
      //
      type={type}
      stacked={stacked}
      visibleSeries={visibleSeries}
      yRange={yRange}
      yLabel={yLabel ?? yColumn.label}
      yUnit={yUnit}
      legend={legend}
      numberFormat={numberFormat}
      axisNumberFormat={axisNumberFormat}
      chartConfig={chartConfig}
      seriesShapeProps={seriesShapeProps}
      chartProps={chartProps}
      chartComponentProps={chartComponentProps}
    />
  );
}

function prepareSeriesColors(allSeries: ChartDimensionValue[]) {
  const basePalette10Categorical = schemeTableau10;
  return new Map(
    allSeries.map((v, i) => [v.value, v.color ?? basePalette10Categorical[i % basePalette10Categorical.length]]),
  );
}

function prepareVisibleSeries(data: ColumnTable, seriesColumn: ChartDimensionColumn, includeEmptySeries: boolean) {
  if (includeEmptySeries) {
    return seriesColumn.values.map((v) => v.value);
  }

  const seriesValues = new Set(data.column(seriesColumn.id));
  return seriesColumn.values.filter((v) => seriesValues.has(v.value)).map((v) => v.value);
}

// build an arquero table defining the full grid of x axis / series combinations, based on config
// we're not using data here at all, just the config, to create an empty grid
function prepareDataGrid(xColumn: ChartDimensionColumn, seriesColumn: ChartDimensionColumn) {
  const xValues = xColumn.values.map((v) => ({ [xColumn.id]: v.value }));
  const seriesValues = seriesColumn.values.map((v) => ({ [seriesColumn.id]: v.value }));
  return from(xValues).cross(from(seriesValues));
}

function prepareChartData(
  dataGrid: ColumnTable,
  data: ColumnTable,
  emptyIsZero: boolean,
  xColId: string,
  xValues: ChartDimensionValue[],
  yColId: string,
  seriesColId: string,
  seriesValues: ChartDimensionValue[],
) {
  const expandedData = dataGrid.join_left(data);
  const filledData = emptyIsZero ? expandedData.impute({ [yColId]: 0 }) : expandedData;

  const result = filledData.select(xColId, seriesColId, yColId).groupby(xColId).pivot(seriesColId, yColId);

  // order the result using the order of the domains.
  // need to use `escape` to prevent arquero from doing its own parsing of the functions
  const resultSorted = result.orderby(
    escape(
      orderByList(
        xColId,
        xValues.map((v) => v.value),
      ),
    ),
    escape(
      orderByList(
        seriesColId,
        seriesValues.map((v) => v.value),
      ),
    ),
  );

  return resultSorted.objects();
}

function prepareChartConfig(
  xColumn: ChartDimensionColumn,
  yColumn: ChartMeasureColumn,
  seriesValues: ChartDimensionValue[],
  seriesColors: Map<string | number, string>,
  yLabel?: string,
  yUnit?: string,
) {
  const label = yLabel != null ? `${yLabel}${yUnit != null ? ` (${yUnit})` : ''}` : yLabel;
  const axesConfig = [xColumn, yColumn].map((c) => ({
    id: c.id,
    label: c.label ?? (c.id === yColumn.id ? label : undefined),
  }));

  const seriesConfig = seriesValues.map((v) => ({
    id: v.value,
    label: v.label ?? label,
    color: seriesColors.get(v.value),
  }));

  return indexBy([...axesConfig, ...seriesConfig], (x) => x.id);
}

function prepareYRange(yColumn: ChartMeasureColumn, statDefinition: ChartStatDefinition) {
  // find stats array element where grouping matches the items of statGrouping, regardless of order
  const stats = yColumn.stats?.find((s) => isChartStatDefinitionEqual(s.definition, statDefinition));

  if (stats == null) {
    return ['dataMin', 'dataMax'];
  }

  const statResult = stats.result;

  return d3
    .scaleLinear()
    .domain([
      statResult.lower < 0 ? statResult.lower * 1.05 : statResult.lower * 0.95,
      statResult.upper > 0 ? statResult.upper * 1.05 : statResult.upper * 0.95,
    ])
    .nice()
    .domain() as [number, number];
}

function prepareChartSeries(series: ChartDimensionValue[], seriesColors: Map<string | number, string>) {
  return series.map((s) => ({
    dataKey: s.value,
    color: seriesColors.get(s.value)!,
  }));
}
