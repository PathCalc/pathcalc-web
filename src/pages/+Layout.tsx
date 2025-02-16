import React from 'react';
import { useData } from 'vike-react/useData';

import { NavLink } from '@/components/NavLink';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LayoutDefault } from '@/layouts/LayoutDefault';

import { Logo } from './(_components)/Logo';
import { Data } from './+data';

export default function Layout({ children }: { children: React.ReactNode }) {
  const {
    allPages,
    general: {
      logo: { title, subtitle },
    },
  } = useData<Data>();

  return (
    <LayoutDefault>
      {/* Header */}
      <div className="h-[56px] max-w-screen flex flex-col justify-center items-center bg-[#C72335] text-white">
        <div className="grow shrink max-h-full w-full max-w-screen lg:max-w-5xl flex flex-row items-stretch">
          <div className="w-72 shrink md:shrink-0 flex flex-row justify-between">
            <Logo title={title} subtitle={subtitle} />
          </div>
          <ScrollArea orientation="horizontal" className="grow shrink h-full">
            <Tabs allPages={allPages} />
          </ScrollArea>
        </div>
      </div>
      {children}
    </LayoutDefault>
  );
}

function Tabs({ allPages }: { allPages: Data['allPages'] }) {
  return (
    <div className="h-full flex flex-row px-5 gap-6 items-center justify-start">
      <NavLink href="/">About</NavLink>

      {allPages.map((page) => (
        <NavLink key={page.slug} href={`/${page.slug}`}>
          {page.title}
        </NavLink>
      ))}
      <div className="w-10" role="presentation"></div>
    </div>
  );
}
