import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/conexoes-atlanticas/',
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  },
  server: {
    port: 3000
  }
});