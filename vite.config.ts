/// <reference types="vitest/config" />
import markdown from '@vavt/vite-plugin-import-markdown';
import react from '@vitejs/plugin-react';
import vike from 'vike/plugin';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      markdown(),
      vike({
        prerender: true,
        trailingSlash: true,
      }),
      react({
        babel: {
          plugins: [['babel-plugin-react-compiler', { target: '18' }]],
        },
      }),
    ],

    resolve: {
      alias: {
        '@': new URL('./src/', import.meta.url).pathname,
        '~shared': new URL('./src-shared/', import.meta.url).pathname,
      },
    },
    base: env.PUBLIC_ENV__BASE_URL,
  };
});
