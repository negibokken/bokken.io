# Chromium のコミットを検索できるサイトを作った

@tags: [Chromium, commits]

@date: [2022-08-30, 2022-08-30]

## はじめに

[Chromium News](https://chromium-news.vercel.app) というサイトを作りました。
現状は Chromium の commit を検索できるだけのサイトだが、今後様々な情報ソースを集約したり、それらをまとめる記事を書ければと思っている。

## ユースケース

ユースケースとしては、たとえば HTTP/3 や Prerender にまつわる commit ってどんな変更をしているんだろう？という疑問を解決するときに使うことを想定している。（他にユースケースがあればサービス改善の参考に教えてほしい）

## 構成

技術的な構成としては下記のサービスやフレームワークを使っている。

* Vercel
* PlanetScale
* Next.js + TypeScript
* Prisma

今回はじめて Vercel や PlanetScale を使ったがとても使いやすかった。
Vercel については main ブランチにマージされてからデプロイが完了するのが早く開発体験がよいなと感じた。
PlanetScale は諸々の概念と、CLI のコマンドを理解するまでは苦労したがそれを覚えてしまえばマネージドな無料 DB として便利に使えるなと感じている。
Next.js、TypeScript はいわずもがな。 Prisma についても PlanetScale のサポートも問題なさそうで、DB へアクセスする処理を書くときに型補完が使えるのはやっぱり便利だなと思った。

## おことわり

現状 commit をバッチで集めて PlanetScale に保存している。そのため古い commit についてはまだ検索不可能なこともある。
しばらくお待ちいただきたい。

## おわりに

今回 Chromium のコミットを検索するためのサイトについて紹介した。
今後もコンテンツを増やしていく予定なので、サービス改善要望などは [@bokken_](https://twitter.com/bokken_) までもらえると嬉しい。
