// @ts-check
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://www.bokken.io",
  outDir: "dist/www.bokken.io",
  srcDir: "src-www",
  publicDir: "public-www",
  trailingSlash: "never",
  build: {
    format: "file",
  },
  compressHTML: true,
  vite: {
    build: {
      minify: true,
    },
  },
});
