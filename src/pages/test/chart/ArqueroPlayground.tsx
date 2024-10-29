import { ColumnTable, escape, from } from 'arquero';
import { mapValues } from 'remeda';

import { orderByList } from '@/lib/data-utils';

export const ArqueroPlayground = () => {
  const years = [2020, 2021, 2022];
  const cities = ['Singapore', 'Warsaw', 'London'];

  function orderTable2(t: ColumnTable) {
    return t.orderby('year', escape(orderByList('city', cities)));
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

function logDf(obj: Record<string, ColumnTable>) {
  console.log(mapValues(obj, (x) => x.objects()));
}
