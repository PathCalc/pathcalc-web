import { ColumnTable, escape, from, op } from 'arquero';
import { schemeTableau10 } from 'd3-scale-chromatic';
import { atom } from 'jotai';
import { useMemo } from 'react';
import { indexBy } from 'remeda';
import { inferSchema, initParser } from 'udsv';

import { d3 } from '@/lib/d3';
import { checkPrimaryKey, orderByList, sameItems } from '@/lib/data-utils';
import { $atomFamily } from '@/lib/jotai';

import { Chart } from './Chart';

const STORAGE = {
  'gh-pages': {
    async get({ path }: { path: string }) {
      const res = await fetch(`/data/${path}`);
      const csv = await res.text();
      return csv;
    },
  },
};

const FACT_TABLES = {
  gOverview1Data: {
    storage: 'gh-pages',
    sharding: ['Scenario'],
    path: '/facts/{$}/{Scenario}.csv',
    dimensions: [],
  },
};

async function getFactTable({ variable, params }: { variable: string; params: Record<string, string> }) {}

type DimensionValue = {
  value: string | number;
  label?: string;
  color?: string;
};

export type DimensionColumn = {
  type: 'dimension';
  id: string;
  label: string;
  values: DimensionValue[];
};

export type MeasureColumn = {
  type: 'measure';
  id: string;
  label: string;
  unit: string;
  stats: { grouping: string[]; column: string; min: number; max: number }[];
};

export function ChartAdapter({
  rawData,
  columns,
  XVariable,
  YVariable,
  SeriesVariable,
  emptyIsZero,
  includeEmptySeries,
  type,
  stacked,
  statGrouping,
  seriesShapeProps,
  chartProps,
}: {
  rawData: ColumnTable;
  columns: (DimensionColumn | MeasureColumn)[];
  XVariable: string;
  YVariable: string;
  SeriesVariable: string;
  emptyIsZero: boolean;
  includeEmptySeries: boolean;
  type: 'line' | 'area' | 'bar';
  stacked: boolean;
  statGrouping: string[];
  seriesShapeProps?: Record<string, unknown>;
  chartProps?: Record<string, unknown>;
}) {
  // Prepare config / data
  checkPrimaryKey(rawData, [XVariable, SeriesVariable]);

  const columnLookup = indexBy(columns, (x) => x.id);

  const seriesColumn = columnLookup[SeriesVariable];
  if (seriesColumn == null || seriesColumn.type !== 'dimension') {
    throw new Error('Invalid series column');
  }
  const xColumn = columnLookup[XVariable];
  if (xColumn == null || xColumn.type !== 'dimension') {
    throw new Error('Invalid x column');
  }
  const yColumn = columnLookup[YVariable];
  if (yColumn == null || yColumn.type !== 'measure') {
    throw new Error('Invalid y column');
  }

  const seriesColors = prepareSeriesColors(seriesColumn.values);

  const series = seriesColumn.values;
  const visibleSeries = prepareVisibleSeries(rawData, seriesColumn, includeEmptySeries);

  const dataGrid = prepareDataGrid(xColumn, seriesColumn);

  const chartData = prepareChartData(dataGrid, rawData, emptyIsZero, xColumn.id, yColumn.id, seriesColumn.id, series);
  const chartConfig = prepareChartConfig(xColumn, yColumn, series, seriesColors);
  const chartSeries = prepareChartSeries(series, seriesColors);
  const yRange = prepareYRange(yColumn, statGrouping);

  return (
    <Chart
      type={type}
      stacked={stacked}
      XVariable={XVariable}
      YVariable={YVariable}
      YRange={yRange}
      data={chartData}
      series={chartSeries}
      visibleSeries={visibleSeries}
      seriesShapeProps={seriesShapeProps}
      chartProps={chartProps}
      chartConfig={chartConfig}
    />
  );
}

function prepareSeriesColors(allSeries: DimensionValue[]) {
  const basePalette10Categorical = schemeTableau10;
  return new Map(
    allSeries.map((v, i) => [v.value, v.color ?? basePalette10Categorical[i % basePalette10Categorical.length]]),
  );
}

function prepareVisibleSeries(data: ColumnTable, seriesColumn: DimensionColumn, includeEmptySeries: boolean) {
  if (includeEmptySeries) {
    return seriesColumn.values.map((v) => v.value);
  }

  const seriesValues = new Set(data.column(seriesColumn.id));
  return seriesColumn.values.filter((v) => seriesValues.has(v.value)).map((v) => v.value);
}

// build an arquero table defining the full grid of x axis / series combinations, based on config
// we're not using data here at all, just the config, to create an empty grid
function prepareDataGrid(xColumn: DimensionColumn, seriesColumn: DimensionColumn) {
  const xValues = xColumn.values.map((v) => ({ [xColumn.id]: v.value }));
  const seriesValues = seriesColumn.values.map((v) => ({ [seriesColumn.id]: v.value }));
  return from(xValues).cross(from(seriesValues));
}

function prepareChartData(
  dataGrid: ColumnTable,
  data: ColumnTable,
  emptyIsZero: boolean,
  xColId: string,
  yColId: string,
  seriesColId: string,
  seriesValues: DimensionValue[],
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
        seriesValues.map((v) => v.value),
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
  xColumn: DimensionColumn,
  yColumn: MeasureColumn,
  seriesValues: DimensionValue[],
  seriesColors: Map<string | number, string>,
) {
  const axesConfig = [xColumn, yColumn].map((c) => ({ id: c.id, label: c.label }));

  const seriesConfig = seriesValues.map((v) => ({ id: v.value, label: v.label, color: seriesColors.get(v.value) }));

  return indexBy([...axesConfig, ...seriesConfig], (x) => x.id);
}

function prepareYRange(yColumn: MeasureColumn, statGrouping: string[]) {
  // find stats array element where grouping matches the items of statGrouping, regardless of order
  const stats = yColumn.stats.find((s) => sameItems(s.grouping, statGrouping));

  if (stats == null) {
    return ['dataMin', 'dataMax'];
  }

  return d3
    .scaleLinear()
    .domain([0, stats.max * 1.05])
    .nice()
    .domain() as [number, number];
}

function prepareChartSeries(series: DimensionValue[], seriesColors: Map<string | number, string>) {
  return series.map((s) => ({
    dataKey: s.value,
    color: seriesColors.get(s.value)!,
  }));
}
