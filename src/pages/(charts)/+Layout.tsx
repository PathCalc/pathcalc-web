import { Info } from 'lucide-react';
import { FC, ReactNode, useId, useState } from 'react';
import { useData } from 'vike-react/useData';

import { Link } from '@/components/Link';
import { NavLink } from '@/components/NavLink';
import { SimpleSelect } from '@/components/SimpleSelect';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LeverConfig, useLever, useLeversConfig } from '@/state/scenario';

import { Data } from './+data';

export const Layout: FC<{ children?: ReactNode }> = ({ children }) => {
  const { allPages } = useData<Data>();

  return (
    <>
      {/* Header */}
      <div className="h-15 flex flex-col justify-center items-center bg-red-500">
        <div className="grow h-full max-w-7xl flex flex-row justify-start items-stretch">
          <Logo />
          <Tabs allPages={allPages} />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col items-center">
        <div className="grow max-w-7xl flex flex-row">
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
    <div id="sidebar" className="w-60 p-5 flex flex-col shrink-0 border-r-2 border-r-gray-200">
      {children}
    </div>
  );
}

function Tabs({ allPages }: { allPages: Data['allPages'] }) {
  return (
    <div className="flex flex-row gap-3 items-center h-full">
      <NavLink href="/">{allPages[0].title}</NavLink>
      {allPages.slice(1).map((page) => (
        <NavLink key={page.slug} href={page.slug}>
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
    <div className="p-5 mb-2 h-full flex flex-row justify-end items-center">
      <Link className="text-manrope" href="/">
        PathCalc
      </Link>
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

function Levers() {
  const leverConfigs = useLeversConfig();
  return (
    <div className="flex flex-col gap-10 my-10">
      {leverConfigs.map((lever) => (
        <Lever key={lever.id} {...lever} />
      ))}
    </div>
  );
}

function Lever({ id, label, description, values }: LeverConfig) {
  const [value, onChange] = useLever(id);
  const sliderId = useId();
  return (
    <div className="flex flex-col gap-4 items-stretch">
      <div className="flex flex-row justify-between items-center">
        <Label htmlFor={sliderId}>{label}</Label>
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger>
              {/* <Button className="rounded-full" variant="ghost" size="icon"> */}
              <Info size={15} />
              {/* </Button> */}
            </TooltipTrigger>
            <TooltipContent side="right">{description}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Slider
        id={sliderId}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={values.min}
        max={values.max}
        step={1}
      />
    </div>
  );
}
