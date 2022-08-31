# Chromium のコミットを検索できるサイトを作った

@tags: [Chromium, commits]

@date: [2022-08-30, 2022-08-30]

## はじめに

[Chromium News](https://chromium-news.vercel.app) というサイトを作りました。
現状は Chromium の commit を検索できるだけのサイトだが、今後様々な情報ソースを集約したり、それらをまとめる記事を書ければと思っている。

## 構成

技術的な構成としては下記のサービスやフレームワークを使っている。

* Vercel
* PlanetScale
* Next.js + TypeScript
* Prisma


今回はじめて Vercel や PlanetScale を使ったが、理解できるととても開発がしやすかった。
