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
  type,
  stacked,
  statGrouping,
  seriesShapeProps,
}: {
  rawData: ColumnTable;
  columns: (DimensionColumn | MeasureColumn)[];
  XVariable: string;
  YVariable: string;
  SeriesVariable: string;
  emptyIsZero: boolean;
  type: 'line' | 'area' | 'bar';
  stacked: boolean;
  statGrouping: string[];
  seriesShapeProps: Record<string, unknown>;
}) {
  // Prepare config / data

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

  checkPrimaryKey(rawData, [XVariable, SeriesVariable]);

  // build an arquero table defining the full grid of x axis / series combinations, based on config
  // we're not using data here at all, just the config, to create an empty grid
  function prepareDataGrid(xColumn: DimensionColumn, seriesColumn: DimensionColumn) {
    const xValues = xColumn.values.map((v) => ({ [xColumn.id]: v.value }));
    const seriesValues = seriesColumn.values.map((v) => ({ [seriesColumn.id]: v.value }));
    return from(xValues).cross(from(seriesValues));
  }

  const dataGrid = prepareDataGrid(xColumn, seriesColumn);

  // useLog(dataGrid, (x) => ({ dataGrid: x.objects() }));

  function prepareData(
    dataGrid: ColumnTable,
    data: ColumnTable,
    emptyIsZero: boolean,
    xCol: DimensionColumn,
    yCol: MeasureColumn,
    seriesCol: DimensionColumn,
  ) {
    const expandedData = dataGrid.join_left(data);
    const filledData = emptyIsZero ? expandedData.impute({ [yCol.id]: 0 }) : expandedData;
    // logDf({ dataGrid, data, expandedData, filledData });

    const result = filledData.select(xCol.id, seriesCol.id, yCol.id).groupby(xCol.id).pivot(seriesCol.id, yCol.id);

    // order the result using the order of the domains.
    // need to use `escape` to prevent arquero from doing its own parsing of the functions
    const resultSorted = result.orderby(
      escape(
        orderByList(
          xCol.id,
          xCol.values.map((v) => v.value),
        ),
      ),
      escape(
        orderByList(
          seriesCol.id,
          seriesCol.values.map((v) => v.value),
        ),
      ),
    );

    return resultSorted.objects();
  }

  const yRange = useMemo(() => {
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
  }, [yColumn, xColumn, seriesColumn]);

  const chartData = useMemo(
    () => prepareData(dataGrid, rawData, emptyIsZero, xColumn, yColumn, seriesColumn),
    [dataGrid, rawData, emptyIsZero, xColumn, yColumn, seriesColumn],
  );

  const chartConfig = useMemo(() => {
    const axesConfig = [xColumn, yColumn].map((c) => ({ id: c.id, label: c.label }));

    const seriesConfig = seriesColumn?.values?.map((v) => ({ id: v.value, label: v.label, color: v.color }));

    return indexBy([...axesConfig, ...seriesConfig], (x) => x.id);
  }, [seriesColumn, xColumn, yColumn]);

  const basePalette10Categorical = schemeTableau10;

  const chartSeries = seriesColumn.values.map((v, i) => ({
    dataKey: v.value,
    color: v.color ?? basePalette10Categorical[i % basePalette10Categorical.length],
  }));

  return (
    <Chart
      type={type}
      stacked={stacked}
      XVariable={XVariable}
      YVariable={YVariable}
      YRange={yRange}
      data={chartData}
      series={chartSeries}
      seriesShapeProps={seriesShapeProps}
      chartConfig={chartConfig}
    />
  );
}
