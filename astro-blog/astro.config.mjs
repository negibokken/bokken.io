import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://blog.bokken.io',
  output: 'static',
  build: {
    format: 'directory',
  },
  integrations: [
    sitemap(),
  ],
  prefetch: {
    prefetchAll: true,
  },
  compressHTML: true,
  vite: {
    build: {
      minify: true,
    },
  },
});
