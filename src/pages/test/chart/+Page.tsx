import { ColumnTable, escape, from } from 'arquero';
import { FC, Suspense, useDeferredValue, useState } from 'react';
import { mapValues } from 'remeda';
import { clientOnly } from 'vike-react/clientOnly';

import { Slider } from '@/components/ui/slider';

const SuspendingDataChart = clientOnly(async () => (await import('./SuspendingDataChart')).SuspendingDataChart);

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
      <SuspendingDataChart scenario={deferredScenario} />
      <div className="flex flex-col gap-10">
        <Slider value={[L1]} onValueChange={([x]) => setL1(x)} min={1} max={4} step={1} />
        <Slider value={[L2]} onValueChange={([x]) => setL2(x)} min={1} max={4} step={1} />
        <Slider value={[L3]} onValueChange={([x]) => setL3(x)} min={1} max={4} step={1} />
        <Slider value={[L4]} onValueChange={([x]) => setL4(x)} min={1} max={4} step={1} />
        <Slider value={[L5]} onValueChange={([x]) => setL5(x)} min={1} max={4} step={1} />
      </div>
      <div>{isLoading ? 'New data is loading...' : ''}</div>
      {/* <ArqueroPlayground /> */}
    </>
  );
};

function logDf(obj: Record<string, ColumnTable>) {
  console.log(mapValues(obj, (x) => x.objects()));
}

/*
const ArqueroPlayground = () => {
  const years = [2020, 2021, 2022];
  const cities = ['Singapore', 'Warsaw', 'London'];

  function orderTable(t: ColumnTable) {
    const cityOrder = orderMap(cities);

    return t.params({ city: cityOrder }).orderby({
      year: (d: any) => d.year,
      city: (d: any, $: any) => $.city.get(d.city),
    });
  }

  function orderTable2(t: ColumnTable) {
    const cityOrder = orderMap(cities);

    return t.orderby(
      'year',
      escape((d: any) => cityOrder.get(d.city)),
    );
  }

  const grid = from(years.map((year) => ({ year }))).cross(from(cities.map((city) => ({ city }))));

  const data = from([
    {
      year: 2022,
      city: 'Warsaw',
      value: 100,
    },
    {
      year: 2021,
      city: 'Warsaw',
      value: 200,
    },
    {
      year: 2021,
      city: 'London',
      value: 350,
    },
    {
      year: 2022,
      city: 'Singapore',
      value: 150,
    },
    {
      year: 2021,
      city: 'Singapore',
      value: 250,
    },
  ]);

  const result = grid.join_left(data).impute({ value: () => null });

  const sorted = orderTable2(result);
  logDf({ grid, data, result, sorted });

  return (
    <div>
      <h1>Arquero Playground</h1>
      <ArqueroOutput df={grid} />
      <ArqueroOutput df={data} />
      <ArqueroOutput df={result} />
    </div>
  );
};

const ArqueroOutput = ({ df }: { df: ColumnTable }) => {
  return <pre>{JSON.stringify(df.objects(), null, 2)}</pre>;
};

*/
