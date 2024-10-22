import { useData } from 'vike-react/useData';

import { Data } from './+data';

export function Page() {
  const chartConfig = useData<Data>();
  return <div>{chartConfig.currentPage.title}</div>;
}
