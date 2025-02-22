import { FC, ReactNode } from 'react';

import { ScrollArea } from '@/components/ui/scroll-area';

import { Levers } from './(_components)/Levers';
import { Presets } from './(_components)/Presets';
import { ScenariosSidebarLayout } from './(_components)/ScenariosSidebarLayout';

export const Layout: FC<{ children?: ReactNode }> = ({ children }) => {
  return (
    <>
      {/* Main content */}
      <div className="grow shrink max-h-full flex flex-col items-center">
        <div className="grow shrink w-screen max-w-screen lg:max-w-5xl flex flex-row items-stretch">
          <ScenariosSidebarLayout>
            <Presets />
            <Levers />
          </ScenariosSidebarLayout>
          <div className="grow shrink">
            <ScrollArea className="h-[calc(100vh-56px)]">
              {children}
              <div className="h-[50vh] md:hidden" role="presentation"></div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </>
  );
};
