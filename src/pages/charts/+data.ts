import { render } from 'vike/abort';
import { PageContextServer } from 'vike/types';
import { z } from 'zod';

import chartPagesConfig from '@/../public/config/chart-pages.json';

// zod schema for chart-pages.json elements
const chartPageSchema = z.object({
  title: z.string(),
  slug: z.string(),
  content: z.object({}),
});

// zod schema for chart-pages.json
const chartPagesSchema = z.object({
  config: z.array(chartPageSchema),
});

export async function data(pageContext: PageContextServer) {
  const { chartId: slug } = pageContext.routeParams;
  const chartPage = chartPagesConfig.config.find((page) => page.slug === slug);

  if (chartPage === undefined) {
    throw render(404, `Chart page "${slug}" doesn't exist`);
  }

  return chartPage;
}

export type Data = Awaited<ReturnType<typeof data>>;
