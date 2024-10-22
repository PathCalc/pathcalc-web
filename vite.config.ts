import react from '@vitejs/plugin-react';
import vike from 'vike/plugin';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
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
      },
    },
    base: env.PUBLIC_ENV__BASE_URL,
  };
});
