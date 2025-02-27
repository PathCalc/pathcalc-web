import { PageContextServer } from 'vike/types';

import chartPagesConfig from '@/../public/config/chart-pages.json';
import generalConfig from '@/../public/config/general.json';
import moreInfoMarkdown from '@/../public/config/info.md';

export async function data(pageContext: PageContextServer) {
  const allPagesConfig = chartPagesConfig.config;

  return {
    allPages: allPagesConfig,
    general: generalConfig,
    moreInfoMarkdown,
  };
}

export type Data = Awaited<ReturnType<typeof data>>;
