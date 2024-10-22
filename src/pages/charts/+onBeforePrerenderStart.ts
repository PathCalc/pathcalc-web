import chartPagesConfig from '@/../public/config/chart-pages.json';

export async function onBeforePrerenderStart() {
  return chartPagesConfig.config.map((page) => `/charts/${page.slug}`);
}
