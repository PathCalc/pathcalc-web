import { HoverCardArrow } from '@radix-ui/react-hover-card';
import { Info } from 'lucide-react';
import { FC, ReactNode, useState } from 'react';
import { useData } from 'vike-react/useData';

import { Link } from '@/components/Link';
import { NavLink } from '@/components/NavLink';
import { SimpleSelect } from '@/components/SimpleSelect';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useBreakpoint } from '@/lib/hooks/tailwind';

import { Levers } from './(components)/Levers';
import { Data } from './+data';

export const Layout: FC<{ children?: ReactNode }> = ({ children }) => {
  const {
    allPages,
    general: {
      logo: { title, subtitle },
    },
  } = useData<Data>();

  return (
    <>
      {/* Header */}
      <div className="h-[56px] max-w-screen flex flex-col justify-center items-center bg-[#C72335] text-white">
        <div className="grow shrink max-h-full w-full max-w-screen lg:max-w-5xl flex flex-row items-stretch">
          <div className="w-72 shrink md:shrink-0 flex flex-row justify-between">
            <Logo title={title} subtitle={subtitle} />
            <MoreInfo />
          </div>
          <ScrollArea orientation="horizontal" className="grow shrink h-full">
            <Tabs allPages={allPages} />
          </ScrollArea>
        </div>
      </div>

      {/* Main content */}
      <div className="grow shrink max-h-full flex flex-col items-center">
        <div className="grow shrink w-screen max-w-screen lg:max-w-5xl flex flex-row items-stretch">
          <ScenariosSidebar>
            {/* <Presets /> */}
            <Levers />
          </ScenariosSidebar>
          <div className="grow shrink">
            <ScrollArea className="h-[calc(100vh-56px)]">
              {children}
              <div className="h-[50vh] sm:hidden"></div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </>
  );
};

function ScenariosSidebar({ children }: { children: React.ReactNode }) {
  const isDesktop = useBreakpoint('md');
  return isDesktop ? <DesktopSidebar>{children}</DesktopSidebar> : <MobileDrawer>{children}</MobileDrawer>;
}

function DesktopSidebar({ children }: { children: ReactNode }) {
  return (
    <div id="sidebar" className="w-72 p-5 pt-10 flex flex-col shrink-0 border-r-2 border-r-gray-200">
      {children}
    </div>
  );
}

function MobileDrawer({ children }: { children: ReactNode }) {
  const [activeSnapPoint, setActiveSnapPoint] = useState<string | number | null>(0.5);

  return (
    <Drawer
      dismissible={false}
      modal={false}
      open={true}
      snapPoints={['50px', '300px', 0.5]}
      activeSnapPoint={activeSnapPoint}
      setActiveSnapPoint={setActiveSnapPoint}
      shouldScaleBackground={false}
      noBodyStyles={true}
      handleOnly={true}
    >
      <DrawerContent className="h-screen">
        <ScrollArea className="h-[calc(100vh-var(--snap-point-height)-60px)] mt-10 pb-10 px-5">{children}</ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}

function Tabs({ allPages }: { allPages: Data['allPages'] }) {
  return (
    <div className="h-full flex flex-row px-5 gap-6 items-center">
      <NavLink href="/">{allPages[0].title}</NavLink>
      {allPages.slice(1).map((page) => (
        <NavLink key={page.slug} href={`/${page.slug}`}>
          {page.title}
        </NavLink>
      ))}
    </div>
  );
}

function Logo({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="p-2 md:p-5 mb-2 h-full flex flex-row justify-start items-center">
      <Link className="font-manrope text-2xl text-nowrap" href="/">
        <span className="font-bold">{title}</span> <span className="font-thin">{subtitle ?? ''}</span>
      </Link>
    </div>
  );
}

function MoreInfo() {
  const isDesktop = useBreakpoint('md');
  return (
    <div className="h-full p-5 flex flex-row justify-center items-center">
      <HoverCard openDelay={100}>
        <HoverCardTrigger>
          <a href="#">
            <Info size={20} className="cursor-pointer" />
          </a>
        </HoverCardTrigger>
        <HoverCardContent side={isDesktop ? 'right' : 'bottom'} align={isDesktop ? 'start' : 'center'}>
          <HoverCardArrow style={{ fill: 'white' }} />
          <div className="flex flex-col gap-2">
            <h2>PathCalc visualisation system</h2>
            <p className="text-xs">More information about the system</p>
            <h3 className="text-xs">Partners</h3>
            <p className="text-xs">
              <a
                className="text-[#C72335]"
                href="https://climatecompatiblegrowth.com/"
                target="_blank"
                rel="noreferrer"
              >
                CCG
              </a>
            </p>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
}

const presetOptions = [
  { value: '11111', label: 'Scenario 1' },
  { value: '11112', label: 'Scenario 2' },
  { value: '11113', label: 'Scenario 3' },
];

function Presets() {
  const [value, onChange] = useState(presetOptions[0].value);
  return <SimpleSelect options={presetOptions} value={value} onChange={onChange} />;
}
