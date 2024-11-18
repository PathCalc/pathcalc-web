import { ReactNode } from 'react';

import { makeHref } from '@/lib/href';

export function Link({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  const absoluteHref = makeHref(href);
  return (
    <a href={absoluteHref} className={className}>
      {children}
    </a>
  );
}
