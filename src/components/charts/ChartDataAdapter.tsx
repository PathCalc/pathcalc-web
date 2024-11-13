import { indexBy } from 'remeda';

import { checkPrimaryKey } from '@/lib/data-utils';
import { useDataset } from '@/state/datasets';

import { ChartBlockProps } from '../page-blocks/chart-block';
import { ChartAdapter } from './ChartAdapter';

/** Hard-coded in the current version */
const SCENARIO_SHARDING = ['Scenario'];

export function ChartDataAdapter({
  scenario,
  dataset,
  x,
  y,
  series,
  options: { extraProps, ...otherOptions },
}: { scenario: string } & ChartBlockProps) {
  const { table, columns } = useDataset(scenario, dataset);

  // Prepare config / data

  const columnLookup = indexBy(columns, (x) => x.id);

  const seriesColumn = columnLookup[series];
  if (seriesColumn == null || seriesColumn.type !== 'dimension') {
    throw new Error('Invalid series column');
  }
  const xColumn = columnLookup[x];
  if (xColumn == null || xColumn.type !== 'dimension') {
    throw new Error('Invalid x column');
  }
  const yColumn = columnLookup[y];
  if (yColumn == null || yColumn.type !== 'measure') {
    throw new Error('Invalid y column');
  }

  checkPrimaryKey(table, [x, series]);

  return (
    <ChartAdapter
      table={table}
      xColumn={xColumn}
      yColumn={yColumn}
      seriesColumn={seriesColumn}
      sharding={SCENARIO_SHARDING}
      chartProps={extraProps?.chart}
      seriesShapeProps={extraProps?.chartSeries}
      chartComponentProps={extraProps?.chartComponents}
      {...otherOptions}
    />
  );
}
