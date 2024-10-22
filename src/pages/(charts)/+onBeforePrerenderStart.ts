import chartPagesConfig from '@/../public/config/chart-pages.json';

export async function onBeforePrerenderStart() {
  return ['/', ...chartPagesConfig.config.slice(1).map((page) => `/${page.slug}`)];
}
