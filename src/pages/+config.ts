import vikeReact from 'vike-react/config';
import type { Config } from 'vike/types';

import generalConfig from '../../public/config/general.json';
import Layout from '../layouts/LayoutDefault.jsx';

// Default config (can be overridden by pages)
// https://vike.dev/config

export default {
  // https://vike.dev/Layout
  Layout,

  // https://vike.dev/head-tags
  title: generalConfig.title,
  description: generalConfig.description,

  extends: vikeReact,
  ssr: false,
  prerender: true,
  trailingSlash: true,
} satisfies Config;
