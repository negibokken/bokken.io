// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

/** @type {import('hast').Element} */
const chainIconHast = {
  type: "element",
  tagName: "svg",
  properties: {
    xmlns: "http://www.w3.org/2000/svg",
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: ["heading-anchor-icon"],
    ariaHidden: "true",
  },
  children: [
    {
      type: "element",
      tagName: "path",
      properties: {
        d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71",
      },
      children: [],
    },
    {
      type: "element",
      tagName: "path",
      properties: {
        d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
      },
      children: [],
    },
  ],
};

// https://astro.build/config
export default defineConfig({
  site: "https://blog.bokken.io",
  outDir: "dist/blog.bokken.io",
  trailingSlash: "never",
  integrations: [mdx(), sitemap()],
  markdown: {
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: "prepend",
          content: chainIconHast,
          properties: {
            className: ["heading-anchor"],
            ariaHidden: "true",
            tabIndex: -1,
          },
        },
      ],
    ],
  },
  prefetch: {
    prefetchAll: true,
  },
  experimental: {
    clientPrerender: true,
  },
  redirects: {
    "/feeds/atom.xml": "/rss.xml",
  },
  compressHTML: true,
  vite: {
    build: {
      minify: true,
    },
  },
});
