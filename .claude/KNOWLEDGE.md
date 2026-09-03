# KNOWLEDGE

## Cloudflare Workers

### Static Assets デプロイ

- Worker script が不要な静的サイトは、Wrangler の `[assets]` に配信ディレクトリを指定し、`main` は設定しない。
- Wrangler 設定は asset ディレクトリの外へ置く。設定ファイルを配信対象に含めないためである。
- Astro の `trailingSlash: "never"` とディレクトリ形式の生成物を併用する場合は、`html_handling = "drop-trailing-slash"` で canonical URL を維持する。
