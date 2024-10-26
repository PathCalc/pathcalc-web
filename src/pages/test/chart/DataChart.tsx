import { useSuspenseQuery } from '@tanstack/react-query';
import { ColumnTable, escape, from, op } from 'arquero';
import { useMemo } from 'react';
import { indexBy, unique } from 'remeda';
import { inferSchema, initParser } from 'udsv';

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

type DimensionColumn = {
  type: 'dimension';
  id: string;
  label: string;
  values: DimensionValue[];
};

type MeasureColumn = {
  type: 'measure';
  id: string;
  label: string;
  unit: string;
  stats: { min: number; max: number };
};

export function DataChart({ scenario }: { scenario: string }) {
  const { data } = useSuspenseQuery({
    queryKey: ['testChartData', scenario],
    queryFn: async () => {
      const res = await fetch(`/data/facts/gOverview1Data/${scenario}.csv`);
      const csv = await res.text();
      const schema = inferSchema(csv);
      const parser = initParser(schema);
      const data = parser.typedObjs(csv);
      return from(data).derive({
        Sector: (d) => op.lower(op.replace(d!.Sector, /\s+/g, '-')),
      });
    },
  });
  const rawData = data;

  // useLog(rawData, (x) => ({ rawData: x.objects() }));

  // ==== CONFIG ====

  const columns: (DimensionColumn | MeasureColumn)[] = [
    {
      id: 'YEAR',
      type: 'dimension',
      label: 'Year',
      values: [
        // { value: 2020 },
        { value: 2021 },
        { value: 2022 },
        { value: 2023 },
        { value: 2024 },
        { value: 2025 },
        { value: 2026 },
        { value: 2027 },
        { value: 2028 },
        { value: 2029 },
        { value: 2030 },
        { value: 2031 },
        { value: 2032 },
        { value: 2033 },
        { value: 2034 },
        { value: 2035 },
        { value: 2036 },
        { value: 2037 },
        { value: 2038 },
        { value: 2039 },
        { value: 2040 },
        { value: 2041 },
        { value: 2042 },
        { value: 2043 },
        { value: 2044 },
        { value: 2045 },
        { value: 2046 },
        { value: 2047 },
        { value: 2048 },
        { value: 2049 },
        { value: 2050 },
      ],
    },
    {
      id: 'Sector',
      type: 'dimension',
      label: 'Sector',
      values: [
        {
          value: 'power-generation',
          label: 'Power generation',
          color: '#d4c0c3',
        },
        {
          value: 'transport',
          label: 'Transport',
          color: '#e04461',
        },
      ],
    },
    {
      id: 'VALUE',
      type: 'measure',
      label: 'Emissions',
      unit: 'MtCO2',
      stats: {
        min: 0,
        max: 38.1,
      },
    },
  ];

  const XVariable = 'YEAR';
  const YVariable = 'VALUE';
  const SeriesVariable = 'Sector';

  const emptyIsZero = true;

  const shapeProps = {
    area: {
      fillOpacity: 1,
      strokeOpacity: 0,
      strokeWidth: 0,
      dot: false,
      activeDot: false,
    },
    line: {
      strokeOpacity: 1,
      strokeWidth: 3,
      dot: false,
    },
    bar: {
      fillOpacity: 1,
      strokeOpacity: 0,
      strokeWidth: 0,
    },
  };

  const type = 'area';
  const stacked = true;

  // ==== END CONFIG ====

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

    const xOrderMap = orderMap(xCol.values.map((v) => v.value));
    const seriesOrderMap = orderMap(seriesCol.values.map((v) => v.value));

    // order the result using the order of the domains.
    // need to use `escape` to prevent arquero from doing its own parsing of the functions
    const resultSorted = result.orderby(
      escape((d: any) => xOrderMap.get(d[xCol.id])),
      escape((d: any) => seriesOrderMap.get(d[seriesCol.id])),
    );

    return resultSorted.objects();
  }

  const chartData = useMemo(
    () => prepareData(dataGrid, rawData, emptyIsZero, xColumn, yColumn, seriesColumn),
    [dataGrid, rawData, emptyIsZero, xColumn, yColumn, seriesColumn],
  );

  //   const chartData = useMemo(() => {
  //     if (rawData === undefined) return [];
  //     const variables = unique([XVariable, YVariable, SeriesVariable]);
  //     return rawData
  //       .select(...variables)
  //       .groupby(XVariable)
  //       .pivot(SeriesVariable, YVariable)
  //       .objects();
  //   }, [rawData]);

  const chartConfig = useMemo(() => {
    const axesConfig = [xColumn, yColumn].map((c) => ({ id: c.id, label: c.label }));

    const seriesConfig = seriesColumn?.values?.map((v) => ({ id: v.value, label: v.label, color: v.color }));

    return indexBy([...axesConfig, ...seriesConfig], (x) => x.id);
  }, [seriesColumn, xColumn, yColumn]);

  const basePalette10Categorical = [
    '#1f77b4',
    '#ff7f0e',
    '#2ca02c',
    '#d62728',
    '#9467bd',
    '#8c564b',
    '#e377c2',
    '#7f7f7f',
    '#bcbd22',
    '#17becf',
  ];

  const chartSeries = seriesColumn.values.map((v, i) => ({
    dataKey: v.value,
    color: v.color ?? basePalette10Categorical[i % basePalette10Categorical.length],
  }));

  const seriesShapeProps = shapeProps[type];

  return (
    <>
      <Chart
        type={type}
        stacked={stacked}
        XVariable={XVariable}
        YVariable={YVariable}
        data={chartData}
        series={chartSeries}
        seriesShapeProps={seriesShapeProps}
        chartConfig={chartConfig}
      />
      <button onClick={() => console.log(chartData)}>Log data</button>
    </>
  );
}

function checkPrimaryKey(data: ColumnTable, primaryKey: string[]) {
  const numRows = data.numRows();

  const numRowsDeduped = data.dedupe(primaryKey).numRows();

  if (numRows !== numRowsDeduped) {
    throw new Error('Primary key check failed');
  }
}

function orderMap<T>(values: T[]): Map<T, number> {
  return new Map(values.map((v, i) => [v, i]));
}
