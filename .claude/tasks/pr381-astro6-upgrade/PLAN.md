# プラン: PR381 Astro 6 Upgrade

## 概要

PR381 の Astro 関連依存更新を、Astro 6 へ上げる方向で peer dependency が壊れない状態にする。

## 背景・目的

`@astrojs/mdx@6.0.3` は `astro@^6.4.0` を要求するため、現在の `astro@^5.3.0` のままでは依存関係が不整合になる。ビルド結果を壊さないように、Astro 本体と公式 integration を整合したバージョンへ更新し、CI と Docker の Node 要件も合わせる。

## アプローチ

- root と `astro/` の `astro` dependency を `^6.4.0` に更新する。
- `@astrojs/mdx@^6.0.3` と `@astrojs/sitemap@^3.7.3` は PR381 の更新として維持する。
- Astro 6 の Node 要件に合わせ、CI と Docker builder を Node 22.12.0 以上に明示する。
- Astro 6 で deprecated になった `z` from `astro:content` を `astro/zod` import に移す。
- `pnpm install` で lockfile を再生成し、`minimumReleaseAge` は変更しない。

## 懸念事項・リスク

- Astro 6 は Vite 7 を含むため、生成される HTML/CSS/JS に差分が出る可能性がある。
- `@astrojs/sitemap@3.7.3` は sitemap index の `lastmod` 精度が変わるため、XML の差分は発生しうる。
- Docker build は外部 image availability に依存するため、ローカル検証時に pull 失敗の可能性がある。
