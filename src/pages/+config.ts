import vikeReact from 'vike-react/config';
import type { Config } from 'vike/types';

import Layout from '../layouts/LayoutDefault.jsx';

// Default config (can be overridden by pages)
// https://vike.dev/config

export default {
  // https://vike.dev/Layout
  Layout,

  // https://vike.dev/head-tags
  title: 'PathCalc',
  description: 'PathCalc visualisation system',

  extends: vikeReact,
} satisfies Config;
