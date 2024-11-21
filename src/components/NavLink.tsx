import { usePageContext } from 'vike-react/usePageContext';

import { Link } from './Link';

export function NavLink({ href, children }: { href: string; children: string }) {
  const pageContext = usePageContext();
  const { urlPathname } = pageContext;
  const isActive = href === '/' ? urlPathname === href : urlPathname.startsWith(href);
  return (
    <Link href={href} className={isActive ? 'underline underline-offset-4 decoration-2' : undefined}>
      {children}
    </Link>
  );
}
