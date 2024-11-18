import { HoverCardArrow } from '@radix-ui/react-hover-card';
import { Info } from 'lucide-react';
import { FC, ReactNode, useState } from 'react';
import { useData } from 'vike-react/useData';

import { Link } from '@/components/Link';
import { NavLink } from '@/components/NavLink';
import { SimpleSelect } from '@/components/SimpleSelect';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

import { Levers } from './(components)/Levers';
import { Data } from './+data';

export const Layout: FC<{ children?: ReactNode }> = ({ children }) => {
  const { allPages } = useData<Data>();

  return (
    <>
      {/* Header */}
      <div className="h-[56px] flex flex-col justify-center items-center bg-[#C72335] text-white">
        <div className="grow w-full max-w-5xl flex flex-row items-stretch">
          <div className="w-72 shrink-0 flex flex-row justify-between">
            <Logo />
            <MoreInfo />
          </div>
          <div className="grow h-full">
            <Tabs allPages={allPages} />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col items-center">
        <div className="grow max-w-5xl flex flex-row">
          <Sidebar>
            {/* <Presets /> */}
            <Levers />
          </Sidebar>
          <div className="flex flex-col grow shrink">{children}</div>
        </div>
      </div>
    </>
  );
};

function Sidebar({ children }: { children: React.ReactNode }) {
  return (
    <div id="sidebar" className="w-72 p-5 flex flex-col shrink-0 border-r-2 border-r-gray-200">
      {children}
    </div>
  );
}

function Tabs({ allPages }: { allPages: Data['allPages'] }) {
  return (
    <div className="flex flex-row pl-5 gap-6 items-center h-full">
      <NavLink href="/">{allPages[0].title}</NavLink>
      {allPages.slice(1).map((page) => (
        <NavLink key={page.slug} href={`/${page.slug}`}>
          {page.title}
        </NavLink>
      ))}
    </div>
  );
}

function Content({ children }: { children: React.ReactNode }) {
  return (
    <div id="page-container" className="grow">
      <div id="page-content" className="p-5 pb-12 min-h-screen flex flex-col">
        {children}
      </div>
    </div>
  );
}

function Logo() {
  return (
    <div className="p-5 mb-2 h-full flex flex-row justify-start items-center">
      <Link className="font-manrope text-2xl text-nowrap" href="/">
        <span className="font-bold">PathCalc</span> <span className="font-thin">Laos</span>
      </Link>
    </div>
  );
}

function MoreInfo() {
  return (
    <div className="h-full p-5 flex flex-row justify-center items-center">
      <HoverCard openDelay={100}>
        <HoverCardTrigger>
          <a href="#">
            <Info size={20} className="cursor-pointer" />
          </a>
        </HoverCardTrigger>
        <HoverCardContent side="right" align="start">
          <HoverCardArrow style={{ fill: 'white' }} />
          <div className="flex flex-col gap-2">
            <p className="text-sm">More info</p>
            <p className="text-xs">Partners</p>
            <p className="text-xs">
              <a className="" href="https://climatecompatiblegrowth.com/">
                Some link
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
