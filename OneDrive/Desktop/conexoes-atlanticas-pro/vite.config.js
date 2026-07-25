import { defineConfig } from 'vite';

export default defineConfig({
  base: '/conexoes-atlanticas-pro/',
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  server: {
    port: 3000
  }
});
