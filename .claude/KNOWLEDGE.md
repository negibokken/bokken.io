# KNOWLEDGE

## Cloudflare Workers

### Static Assets デプロイ

- Worker script が不要な静的サイトは、Wrangler の `[assets]` に配信ディレクトリを指定し、`main` は設定しない。
- Wrangler 設定は asset ディレクトリの外へ置く。設定ファイルを配信対象に含めないためである。
- Astro の `trailingSlash: "never"` とディレクトリ形式の生成物を併用する場合は、`html_handling = "drop-trailing-slash"` で canonical URL を維持する。
- 通常ファイルを Static Assets から直接配信しつつ一部だけ Worker で処理する場合は、`binding = "ASSETS"` と `run_worker_first` の対象パターンを設定する。`OPTIONS` を処理するパスも対象に含める。
- `_headers` は静的レスポンスのヘッダーに向いている。リダイレクト、動的な `Clear-Site-Data`、互換 URL の内部書き換えは Worker script で処理する。

### Custom Domain の段階移行

- Custom Domain と同名の外部管理 DNS レコードが存在すると、Wrangler はエラーコード `100117` でトリガー更新を拒否する。旧レコードの内容と復旧値を確認してから削除し、再デプロイする。
- 複数ホストを移行するときは、Worker のデプロイと本番スモークテストをホスト単位で直列化する。前段の検証失敗時に後続の Custom Domain を変更しない構成にする。
- 本番スモークテストでは本文とステータスだけでなく `cf-ray` も確認し、旧オリジンの正常応答を Worker の成功と取り違えないようにする。
- 2026-09-03 に `blog.bokken.io` を `bokken-blog`、`x.bokken.io` を `bokken-x`、`bokken.io` と `www.bokken.io` を `bokken-www` へ移行した。旧 nginx（`160.16.220.65`）は DNS から外しただけで、復旧先として稼働を維持している。
