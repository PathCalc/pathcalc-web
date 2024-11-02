import { FC, useDeferredValue, useState } from 'react';
import { clientOnly } from 'vike-react/clientOnly';

import { Slider } from '@/components/ui/slider';

import { OverviewChart1B, OverviewChart2A } from './test-charts';

const OverviewChart1 = clientOnly(async () => (await import('./test-charts')).OverviewChart1A);

export const Page: FC = () => {
  const [L1, setL1] = useState(1);
  const [L2, setL2] = useState(1);
  const [L3, setL3] = useState(1);
  const [L4, setL4] = useState(1);
  const [L5, setL5] = useState(1);
  const scenario = L1.toString() + L2.toString() + L3.toString() + L4.toString() + L5.toString();
  const deferredScenario = useDeferredValue(scenario);
  const isLoading = scenario !== deferredScenario;

  return (
    <>
      <div className="flex flex-row">
        <OverviewChart1 scenario={deferredScenario} />
        <OverviewChart1B scenario={deferredScenario} />
      </div>
      <div className="flex flex-row">
        <OverviewChart2A scenario={deferredScenario} />
      </div>
      <div className="flex flex-col gap-10">
        <Slider value={[L1]} onValueChange={([x]) => setL1(x)} min={1} max={4} step={1} />
        <Slider value={[L2]} onValueChange={([x]) => setL2(x)} min={1} max={4} step={1} />
        <Slider value={[L3]} onValueChange={([x]) => setL3(x)} min={1} max={4} step={1} />
        <Slider value={[L4]} onValueChange={([x]) => setL4(x)} min={1} max={4} step={1} />
        <Slider value={[L5]} onValueChange={([x]) => setL5(x)} min={1} max={4} step={1} />
      </div>
      {/* <ArqueroPlayground /> */}
    </>
  );
};
