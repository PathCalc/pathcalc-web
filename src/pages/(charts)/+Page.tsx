import { useMemo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import ReactFromJSONpkg from 'react-from-json';
import { Config } from 'vike-react/Config';
import { useData } from 'vike-react/useData';

import { ChartBlock } from '@/components/page-blocks/chart-block';
import { ContainerBlock, RowBlock } from '@/components/page-blocks/layout-blocks';
import { ErrorFallback } from '@/components/react/ErrorFallback';

import { Data } from './+data';

// fix issue with react-from-json CJS export in server/client
const ReactFromJSON = ((ReactFromJSONpkg as any).default as typeof ReactFromJSONpkg) || ReactFromJSONpkg;

const mapping = {
  container: ContainerBlock,
  row: RowBlock,
  chart: ChartBlock,
};

function mapProp(prop: any): any {
  if (prop == null) return null;
  const { type, items, ...rest } = prop;

  return {
    type,
    props: {
      ...rest,
      children: items?.map(mapProp),
    },
  };
}

export function Page() {
  const { currentPage, general } = useData<Data>();
  return (
    <>
      <Config title={`${currentPage.title} | ${general.title}`} />
      <ErrorBoundary fallback={<ErrorFallback message="There was an error while displaying this page." />}>
        <ConfigurablePage />
      </ErrorBoundary>
    </>
  );
}

function ConfigurablePage() {
  const chartConfig = useData<Data>();

  const contentConfig = chartConfig.currentDetail.content;
  const processedConfig = useMemo(() => mapProp(contentConfig), [contentConfig]);

  return <ReactFromJSON key={chartConfig.currentPage.slug} entry={processedConfig} mapping={mapping} />;
}

/*
    <ContainerBlock>
      <RowBlock title="Emissions">
        <ChartBlock
          dataset="Overview1"
          x="YEAR"
          y="VALUE"
          series="TECHNOLOGY:Sector"
          options={{
            type: 'area',
            stacked: true,
            legend: false,
            extraProps: {
              chart: {
                syncId: 'year',
              },

              chartComponents: {
                XAxis: {
                  tickLine: true,
                },
              },
            },
          }}
        />
        <ChartBlock
          dataset="Overview1agg"
          x="YEAR:Period"
          y="VALUE"
          series="TECHNOLOGY:Sector"
          options={{
            type: 'bar',
            stacked: true,
            extraProps: {
              chartSeries: {
                barSize: 70,
              },
            },
          }}
        />
      </RowBlock>
      <RowBlock title="Costs">
        <ChartBlock
          dataset="Overview2"
          x="YEAR"
          y="VALUE"
          series="CostType"
          options={{
            type: 'area',
            stacked: true,
            legend: false,
            extraProps: {
              chart: {
                syncId: 'year',
                stackOffset: 'sign',
              },
              chartSeries: {
                dot: false,
              },
              chartComponents: {
                XAxis: {
                  tickLine: true,
                },
                ChartLegend: {
                  align: 'right',
                  verticalAlign: 'top',
                  layout: 'vertical',
                },
              },
            },
          }}
        />
        <ChartBlock
          dataset="Overview2agg"
          x="YEAR:Period"
          y="VALUE"
          series="CostType"
          options={{
            type: 'bar',
            stacked: true,
            legend: 'right',
            extraProps: {
              chartSeries: {
                barSize: 70,
              },
            },
          }}
        />
      </RowBlock>
    </ContainerBlock>

*/
