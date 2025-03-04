import { from } from 'arquero';
import { atom, useAtomValue } from 'jotai';
import { useMemo } from 'react';
import { inferSchema, initParser } from 'udsv';

import { Dataset, DatasetColumn } from '~shared/pipeline/models/dataset/types';
import { ChartAdapterColumns } from '@/components/charts/ChartAdapter';
import { makeFilePath } from '@/lib/href';
import { $atomFamily } from '@/lib/jotai';

import { s_firstScenario } from './scenario';

interface DataFetchFamilyParam {
  datasetName: string;
  scenario: string;
}

// export const s_overviewData1Family = $atomFamily(({ scenario }: { scenario: string }) =>
//   atom(async (get) => {
//     const data = await get(s_rawDataFetchFamily({ dataset: 'gOverview1Data', scenario }));
//     return data.derive({
//       Sector: (d) => op.lower(op.replace(d!.Sector, /\s+/g, '-')),
//     });
//   }),
// );

const s_datasetMetadataFamily = $atomFamily(({ datasetName }: { datasetName: string }) =>
  atom(async () => {
    const res = await fetch(makeFilePath(`/data/fact-tables/${datasetName}/_meta.json`));
    const data = await res.json();
    return data as Dataset;
  }),
);

const s_rawDataFetchFamily = $atomFamily(({ datasetName, scenario }: DataFetchFamilyParam) =>
  atom(async () => {
    const res = await fetch(makeFilePath(`/data/fact-tables/${datasetName}/${scenario}.csv`));
    return await res.text();
  }),
);

const s_datasetCsvParserFamily = $atomFamily(({ datasetName }: { datasetName: string }) =>
  atom(async (get) => {
    const firstScenario = get(s_firstScenario);
    const rawText = await get(s_rawDataFetchFamily({ datasetName, scenario: firstScenario }));
    const { columns } = await get(s_datasetMetadataFamily({ datasetName }));
    const columnLookup = new Map(columns.map((c) => [c.name, c]));
    const schema = inferSchema(rawText);
    schema.cols.forEach((col) => {
      const datasetColumn = columnLookup.get(col.name);
      if (datasetColumn) {
        col.type = datasetColumn.type === 'measure' ? 'n' : 's';
      }
    });
    return initParser(schema);
  }),
);

const s_datasetTableFamily = $atomFamily(({ datasetName, scenario }: DataFetchFamilyParam) =>
  atom(async (get) => {
    const parser = await get(s_datasetCsvParserFamily({ datasetName }));
    const rawText = await get(s_rawDataFetchFamily({ datasetName, scenario }));

    const data = parser.typedObjs(rawText);
    return from(data);
  }),
);

export function useDatasetMetadata(datasetName: string) {
  return useAtomValue(s_datasetMetadataFamily({ datasetName }));
}

export function useDataset(scenario: string, datasetName: string) {
  const { columns } = useDatasetMetadata(datasetName);
  const chartColumns = useMemo(() => datasetColumnsToChartAdapterFormat(columns), [columns]);

  const table = useAtomValue(s_datasetTableFamily({ datasetName, scenario }));

  return {
    table,
    columns: chartColumns,
  };
}

function datasetColumnsToChartAdapterFormat(columns: DatasetColumn[]): ChartAdapterColumns {
  return columns.map((c) => {
    const c2: any = {
      id: c.name,
      type: c.type,
      label: c.label,
    };

    if (c.type === 'dimension') {
      if (c.domainType === 'local') {
        c2.values = c.domain.map((d) => ({
          value: d.id,
          label: d.id,
        }));
      } else if (c.domainType === 'linked') {
        c2.values = c.domain.content.table.map((d) => ({
          value: d.id,
          label: d.label,
          color: d.color,
        }));
        if (c2.label === undefined) {
          c2.label = c.domain.label;
        }
      }
    } else {
      c2.stats = c.stats;
      c2.aggregationMethod = c.aggregationMethod;
    }
    return c2 as ChartAdapterColumns[number];
  });
}
