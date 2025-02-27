/// <reference types="vitest/config" />
import markdown from '@vavt/vite-plugin-import-markdown';
import react from '@vitejs/plugin-react';
import vike from 'vike/plugin';
import { defineConfig, loadEnv } from 'vite';
import { cjsInterop } from 'vite-plugin-cjs-interop';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      markdown(),
      vike({}),
      react({
        babel: {
          plugins: [['babel-plugin-react-compiler', { target: '18' }]],
        },
      }),
      cjsInterop({
        dependencies: ['react-compiler-runtime', 'react-from-json'],
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
