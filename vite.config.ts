import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import vike from 'vike/plugin';

export default defineConfig({
  plugins: [vike({}), react({})],

  resolve: {
    alias: {
      '@': new URL('./src/', import.meta.url).pathname,
    },
  },
});
