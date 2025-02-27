import { FC, ReactNode } from 'react';
import { usePageContext } from 'vike-react/usePageContext';

import { ScrollArea } from '@/components/ui/scroll-area';

import { Levers } from './(_components)/Levers';
import { Presets } from './(_components)/Presets';
import { ScenariosSidebarLayout } from './(_components)/ScenariosSidebarLayout';

export const Layout: FC<{ children?: ReactNode }> = ({ children }) => {
  const pageContext = usePageContext();
  return (
    <>
      {/* Main content */}
      <div className="grow shrink max-h-full flex flex-col items-center">
        <div className="grow shrink w-screen max-w-screen lg:max-w-7xl flex flex-row items-stretch">
          <ScenariosSidebarLayout>
            <Presets />
            <Levers />
          </ScenariosSidebarLayout>
          <div key={pageContext.urlPathname} className="grow shrink">
            <ScrollArea className="h-[calc(100dvh-56px)]">
              <div className="mx-2 sm:mx-0">{children}</div>
              <div className="h-[50vh] sm:hidden" role="presentation"></div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </>
  );
};
