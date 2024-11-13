import { partRegex } from 'part-regex';
import { PageContextServer } from 'vike/types';

const routeRegex = partRegex`/${/([a-z-]+)?/}`;

export function route(pageContext: PageContextServer) {
  // const allowedRoutes = ['/'].concat(chartPagesConfig.config.map((p) => p.slug));
  // if (!allowedRoutes.includes(pageContext.urlPathname)) return false;

  const match = pageContext.urlPathname.match(routeRegex);

  if (!match) return false;

  const [, id] = match;

  if (id == null) {
    return { routeParams: {} };
  }

  return { routeParams: { chartId: id } };
}
