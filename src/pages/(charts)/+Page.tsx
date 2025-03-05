import { useMemo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { default as ReactFromJSON } from 'react-from-json';
import { Config } from 'vike-react/Config';
import { useData } from 'vike-react/useData';

import { ChartBlock } from '@/components/page-blocks/chart-block';
import { ContainerBlock, PlaceholderBlock, RowBlock, TextBlock } from '@/components/page-blocks/layout-blocks';
import { makeRenderFallback } from '@/components/react/ErrorFallback';
import { useSetGeneralConfig } from '@/state/general-config';

import { Data } from './+data';

const mapping = {
  container: ContainerBlock,
  row: RowBlock,
  chart: ChartBlock,
  text: TextBlock,
  placeholder: PlaceholderBlock,
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

  useSetGeneralConfig(general); //TODO figure out a global method to do this

  return (
    <>
      <Config title={`${currentPage.title} | ${general.title}`} />
      <ErrorBoundary fallbackRender={makeRenderFallback('There was an error while displaying this page.')}>
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
