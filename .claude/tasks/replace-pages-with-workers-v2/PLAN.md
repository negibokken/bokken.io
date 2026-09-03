# プラン: replace-pages-with-workers-v2

## 概要

Astro の静的成果物を Cloudflare Workers Static Assets として、既存の `bokken-blog`、`bokken-www`、`bokken-x` Worker へデプロイする。

## アプローチ

- Astro の既存静的ビルド設定を復元する。
- Wrangler を固定バージョンで管理し、3 Worker の配信ディレクトリを設定する。
- CI の dry-run と `workers.dev` への実デプロイで検証する。

## 制約

- 本番ドメイン、Cloudflare routes、DNS、nginx は変更しない。
- `pnpm-workspace.yaml` の `minimumReleaseAge` は変更しない。
