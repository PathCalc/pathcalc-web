import { Suspense, useDeferredValue } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { ChartBlockConfig } from '~shared/app/models/page-blocks/chart-block';
import { useScenario } from '@/state/scenario';

import { ChartDataAdapter } from '../charts/ChartDataAdapter';
import { makeRenderFallback } from '../react/ErrorFallback';

export type ChartBlockProps = Omit<ChartBlockConfig, 'type'>;

export const ChartBlock = ({ title, ...props }: ChartBlockProps) => {
  const scenario = useScenario();
  const deferredScenario = useDeferredValue(scenario);
  return (
    <div className="grow w-full min-h-[220px] h-[220px] max-h-[220px] flex flex-col items-stretch justify-start gap-2">
      <div>{title != null ? <h3 className="inline-block">{title}</h3> : null}</div>
      <ErrorBoundary fallbackRender={makeRenderFallback('Something went wrong while displaying this chart.')}>
        <Suspense fallback={null}>
          <ChartDataAdapter scenario={deferredScenario} {...props} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};
