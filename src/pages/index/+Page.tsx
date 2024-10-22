import { useData } from 'vike-react/useData';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Data } from './+data';

export default function Page() {
  const data = useData<Data>();
  return (
    <>
      <Tabs>
        <TabsList>
          {data.map((page) => (
            <TabsTrigger key={page.slug} value={page.slug}>
              {page.title}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </>
  );
}
