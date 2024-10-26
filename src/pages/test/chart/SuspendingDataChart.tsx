import { Suspense } from 'react';

import { DataChart } from './DataChart';

export const SuspendingDataChart = ({ scenario }: { scenario: string }) => {
  return (
    <Suspense fallback={<h1 className="text-xl">Loading</h1>}>
      <DataChart scenario={scenario} />
    </Suspense>
  );
};
