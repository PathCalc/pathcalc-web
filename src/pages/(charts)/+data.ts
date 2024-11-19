import { useConfig } from 'vike-react/useConfig';
import { render } from 'vike/abort';
import { PageContextServer } from 'vike/types';

import chartPagesConfig from '@/../public/config/chart-pages.json';
import generalConfig from '@/../public/config/general.json';

// // zod schema for chart-pages.json elements
// const chartPageSchema = z.object({
//   title: z.string(),
//   slug: z.string(),
//   content: z.object({}),
// });

// // zod schema for chart-pages.json
// const chartPagesSchema = z.object({
//   config: z.array(chartPageSchema),
// });

export async function data(pageContext: PageContextServer) {
  const config = useConfig();
  const { chartId: slug } = pageContext.routeParams;
  const pageConfig = chartPagesConfig.config;
  const chartPage = slug === undefined ? pageConfig[0] : pageConfig.find((page) => page.slug === slug);

  if (chartPage === undefined) {
    throw render(404, `Chart page "${slug}" doesn't exist`);
  }

  const detailConfig = (await import(`@/../public/config/pages/${chartPage.slug}.json`)).default;

  config({
    title: `${chartPage.title} |  ${generalConfig.title}`,
  });

  return {
    currentPage: chartPage,
    currentDetail: detailConfig,
    allPages: pageConfig,
    general: generalConfig,
  };
}

export type Data = Awaited<ReturnType<typeof data>>;
