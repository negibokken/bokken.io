# プラン: migrate-domains-to-workers

## 概要

既存の `bokken-blog`、`bokken-x`、`bokken-www` Workers を nginx と機能互換にし、`blog.bokken.io`、`x.bokken.io`、`bokken.io`、`www.bokken.io` を段階的に Custom Domain へ移行する。

## 背景・目的

3 Workers は Static Assets としてデプロイ済みだが、`bokken-www` と `bokken-x` には nginx が共有していた Astro 成果物や特殊レスポンスが含まれていない。本番ドメインを切り替える前に配信内容と HTTP 挙動を揃える必要がある。

## アプローチ

- Astro の成果物から Worker ごとの配信ディレクトリを生成する。
- Static Assets の `_headers` と必要なパスだけを処理する Worker スクリプトで nginx の挙動を再現する。
- Workers.dev で検証後、Custom Domain を blog、x、www の順に切り替える。
- 各段階でスモークテストを行い、失敗した場合は後続の切り替えを停止する。

## 懸念事項・リスク

- Custom Domain の設定時に既存の DNS-only A レコードが置換される。
- `x.bokken.io` の実験ページは COEP、CORS、Clear-Site-Data などレスポンスヘッダーに依存する。
- ロールバックに備え、旧 nginx と元の A レコード値 `160.16.220.65` は維持する。
