import { from, op } from 'arquero';
import { atom, useAtom } from 'jotai';
import { Suspense, useMemo, useState } from 'react';
import { inferSchema, initParser } from 'udsv';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { $atomFamily } from '@/lib/jotai';

import { withSuspense } from '../../../lib/withSuspense';
import { ChartAdapter, DimensionColumn, MeasureColumn } from './ChartAdapter';

interface DataFetchFamilyParam {
  dataset: string;
  scenario: string;
}

const s_rawDataFetchFamily = $atomFamily(({ dataset, scenario }: DataFetchFamilyParam) =>
  atom(async () => {
    const res = await fetch(`/data/facts/${dataset}/${scenario}.csv`);
    const csv = await res.text();
    const schema = inferSchema(csv);
    const parser = initParser(schema);
    const data = parser.typedObjs(csv);
    return from(data);
  }),
);

export const s_overviewData1Family = $atomFamily(({ scenario }: { scenario: string }) =>
  atom(async (get) => {
    const data = await get(s_rawDataFetchFamily({ dataset: 'gOverview1Data', scenario }));
    return data.derive({
      Sector: (d) => op.lower(op.replace(d!.Sector, /\s+/g, '-')),
    });
  }),
);

export const OverviewChart1A = withSuspense(OverviewChart1AImpl, <h1 className="text-xl">Loading</h1>);

function OverviewChart1AImpl({ scenario }: { scenario: string }) {
  const [rawData] = useAtom(s_overviewData1Family({ scenario }));

  // ==== CONFIG ====
  const columns: (DimensionColumn | MeasureColumn)[] = [
    {
      id: 'YEAR',
      type: 'dimension',
      label: 'Year',
      values: [
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
      stats: [
        {
          grouping: ['YEAR', 'Scenario'],
          column: 'VALUE',
          min: 1.34,
          max: 50,
        },
      ],
    },
  ];

  const XVariable = 'YEAR';
  const YVariable = 'VALUE';
  const SeriesVariable = 'Sector';

  const statGrouping = ['YEAR', 'Scenario'];

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

  const seriesShapeProps = shapeProps[type];
  const chartProps = {
    syncId: 'year',
  };

  // ==== END CONFIG ====
  return (
    <ChartAdapter
      rawData={rawData}
      columns={columns}
      XVariable={XVariable}
      YVariable={YVariable}
      SeriesVariable={SeriesVariable}
      emptyIsZero={emptyIsZero}
      includeEmptySeries={false}
      type={type}
      stacked={stacked}
      statGrouping={statGrouping}
      seriesShapeProps={seriesShapeProps}
      chartProps={chartProps}
    />
  );
}

export const OverviewChart1B = withSuspense(OverviewChart1BImpl, <h1 className="text-xl">Loading</h1>);

function OverviewChart1BImpl({ scenario }: { scenario: string }) {
  const [rawData] = useAtom(s_overviewData1Family({ scenario }));

  const data = useMemo(() => {
    return rawData
      .groupby(['Sector'])
      .rollup({ VALUE: (g) => op.sum(g!.VALUE) })
      .derive({ Period: () => '2020-2050' });
  }, [rawData]);

  // ==== CONFIG ====
  const columns: (DimensionColumn | MeasureColumn)[] = [
    {
      id: 'Period',
      type: 'dimension',
      label: 'Period',
      values: [{ value: '2020-2050' }],
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
      stats: [
        {
          grouping: ['Scenario'],
          column: 'VALUE',
          min: 568,
          max: 1272,
        },
      ],
    },
  ];

  const XVariable = 'Period';
  const YVariable = 'VALUE';
  const SeriesVariable = 'Sector';

  const statGrouping = ['Scenario'];

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
      barSize: 100,
    },
  };

  const type = 'bar';
  const stacked = true;

  const seriesShapeProps = shapeProps[type];

  return (
    <ChartAdapter
      rawData={data}
      columns={columns}
      XVariable={XVariable}
      YVariable={YVariable}
      SeriesVariable={SeriesVariable}
      emptyIsZero={emptyIsZero}
      includeEmptySeries={false}
      type={type}
      stacked={stacked}
      statGrouping={statGrouping}
      seriesShapeProps={seriesShapeProps}
    />
  );
}

const s_overviewData2Family = $atomFamily(({ scenario }: { scenario: string }) =>
  atom(async (get) => {
    const data = await get(s_rawDataFetchFamily({ dataset: 'gOverview2Data', scenario }));
    return data.derive({
      Type: (d) => op.lower(op.replace(d!.Type, /\s+/g, '-')),
    });
  }),
);

export const OverviewChart2A = withSuspense(OverviewChart2AImpl, <h1 className="text-xl">Loading</h1>);

function OverviewChart2AImpl({ scenario }: { scenario: string }) {
  const [rawData] = useAtom(s_overviewData2Family({ scenario }));

  // ==== CONFIG ====
  const columns: (DimensionColumn | MeasureColumn)[] = [
    {
      id: 'YEAR',
      type: 'dimension',
      label: 'Year',
      values: [
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
      id: 'Type',
      type: 'dimension',
      label: 'Type',
      values: [
        {
          value: 'variable-costs',
          label: 'Variable costs',
          color: '#4c5f84',
        },
        {
          value: 'capital-investment',
          label: 'Capital investment',
          color: '#6fe0ea',
        },
        {
          value: 'random-costs',
          label: 'Random costs',
          color: 'antiquewhite',
        },
        {
          value: 'fixed-costs',
          label: 'Fixed costs',
          color: '#008b8b',
        },
      ],
    },
    {
      id: 'VALUE',
      type: 'measure',
      label: 'Costs',
      unit: 'M$',
      stats: [
        {
          grouping: ['YEAR', 'Scenario'],
          column: 'VALUE',
          min: -500,
          max: 36172,
        },
      ],
    },
  ];

  const XVariable = 'YEAR';
  const YVariable = 'VALUE';
  const SeriesVariable = 'Type';
  const sharding = ['Scenario'];

  const statGrouping = ['YEAR', 'Scenario'];

  const emptyIsZero = true;
  const [includeEmptySeries, setIncludeEmptySeries] = useState(true);

  const shapeProps = {
    area: {
      fillOpacity: 1,
      strokeOpacity: 0,
      strokeWidth: 2,
      stroke: '#000000',
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

  const [type, setType] = useState<'line' | 'area' | 'bar'>('line');
  const [stacked, setStacked] = useState(true);

  const seriesShapeProps = shapeProps[type];
  const chartProps = {
    syncId: 'year',
    stackOffset: 'sign', //'sign',
  };

  // ==== END CONFIG ====
  return (
    <>
      <ChartAdapter
        rawData={rawData}
        columns={columns}
        XVariable={XVariable}
        YVariable={YVariable}
        SeriesVariable={SeriesVariable}
        emptyIsZero={emptyIsZero}
        includeEmptySeries={includeEmptySeries}
        statGrouping={statGrouping}
        //
        type={type}
        stacked={stacked}
        seriesShapeProps={seriesShapeProps}
        chartProps={chartProps}
      />
      <div className="flex flex-col gap-4">
        <Switch checked={includeEmptySeries} onCheckedChange={setIncludeEmptySeries} title="Include empty series" />
        <Switch checked={stacked} onCheckedChange={setStacked} title="Stacked" />
        <ChartTypeSelect value={type} onChange={setType} />
      </div>
    </>
  );
}

function ChartTypeSelect({ value, onChange }: { value: string; onChange: (value: 'line' | 'area' | 'bar') => void }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="line">Line</SelectItem>
        <SelectItem value="area">Area</SelectItem>
        <SelectItem value="bar">Bar</SelectItem>
      </SelectContent>
    </Select>
  );
}
