import chartPagesConfig from '@/../public/config/chart-pages.json';

export async function data() {
  return chartPagesConfig.config;
}

export type Data = Awaited<ReturnType<typeof data>>;
