# KNOWLEDGE

## Astro

### Astro 6 Upgrade

- Astro 6 では `astro:content` の型定義が `.astro/content.d.ts` に生成されるため、`tsconfig.json` の `include` は `.astro/types.d.ts` 固定ではなく `.astro/**/*.d.ts` を含める必要がある。
- `markdown.rehypePlugins` は Astro 6 で deprecated になっているため、`@astrojs/markdown-remark` の `unified()` を使って `markdown.processor` に移行する。
- `getCollection()` の戻り順に依存した一覧は Astro の更新で表示順が変わるため、公開日などの明示的なキーでソートする。
