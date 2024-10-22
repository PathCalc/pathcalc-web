import { FC, ReactNode } from 'react';
import { useData } from 'vike-react/useData';

import { NavLink } from '@/components/NavLink';

import { Data } from './+data';

export const Layout: FC<{ children?: ReactNode }> = ({ children }) => {
  const { allPages } = useData<Data>();

  return (
    <div className="grow flex flex-col">
      <div className="flex flex-row gap-3">
        <NavLink href="/">{allPages[0].title}</NavLink>
        {allPages.slice(1).map((page) => (
          <NavLink key={page.slug} href={page.slug}>
            {page.title}
          </NavLink>
        ))}
      </div>

      <div className="grow flex items-center justify-center h-full outline-2 outline outline-red-300">{children}</div>
    </div>
  );
};
