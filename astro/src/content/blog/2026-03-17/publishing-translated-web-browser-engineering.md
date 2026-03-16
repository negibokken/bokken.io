---
title: "Web Browser Engineerginの翻訳本「Webブラウザエンジニアリング」を出版しました"
description: "2026年3月17日に、Web Browser Engineeringの翻訳本「Webブラウザエンジニアリング」を出版しました。"
pubDate: 2026-03-17
tags: ["Web", "Browser"]
---

## はじめに

ご無沙汰しています[@bokken\_](https://x.com/bokken_)です。しばらくいろんな更新が滞っていたのは「[Webブラウザエンジニアリング](https://www.oreilly.co.jp/books/9784814401574/)」の翻訳をしていたからでした。本記事では、なぜ翻訳したのか、どんな本なのかといった内容を紹介していきます。

<img src="./img/web-browser-engineering.jpeg" alt="Webブラウザエンジニアリング書影" height="300px" style="display:block;margin:0 auto; height:300px" />

## なぜ本書を翻訳したのか

本書の翻訳をしようと思ったきっかけは、2023年頃に[Web Browser Engineering](https://browser.engineering/)というWebサイトを発見したことです。
最初は個人の趣味でやっているプロジェクトだと思っていたら、実はユタ大学の准教授（当時は助教授）であるPavel Panchekhaさんと、ChromeのPrincipal Software Engineer / DirectorであるChris Harrelson さんのお二人が共同で進めているプロジェクトだと知りました。**ブラウザ研究者と、Chrome開発者のエンジニアが書いた本が面白くないわけありません**。

内容としても、Webの歴史から、ブラウザの構成要素、ブラウザやソフトウェアのエンジニアリングについて、CSS、JavaScript、ブラウザのセキュリティなど、ブラウザに関するあらゆることが書かれていました。
また、Chris HarrelsonさんGoogle Chromeのレンダリングエンジンである「[RenderingNG](https://developer.chrome.com/docs/chromium/renderingng)」のリアーキテクトを推進した人物です。
これほどまでに、実際のWebブラウザについて書ける人は世界にも数えられるほどしかいないと思います。

しかも、[Web Browser Engineering](https://browser.engineering/)を[書籍化](https://global.oup.com/academic/product/web-browser-engineering-9780198913863)したものが、2025年1月7日にそれがOxford University Pressから出版されるということを知りました。

この書籍はブラウザオタクとして日本のみなさんに届けないわけにはいかないと思い、翻訳することにしました。

## どんな本か

Pythonを使ってステップバイステップでブラウザを実装していく形式の本です。
実装をインクリメンタルに改良していく形式なので、順番に進めていくことで、ブラウザの構成要素や、ブラウザのエンジニアリングについて理解を深めることができます。
章ごとに演習問題が用意されているので、その章で学んだ内容を元に考えて自分のブラウザを改良していくことができます。

Pythonのパッケージや、Skia、Dukpyといったライブラリを使っているので、環境構築に少し手間がかかるかもしれません。
そんなときのために、環境構築の参考になる[リポジトリ](https://github.com/negibokken/web-browser-engineering-step-by-step)も用意しています。本質ではないところに時間を取られたり、挫折してしまうのはもったいないと思ったのでぜひ参考にしてみてください。
（とはいえ、すべての環境で動作するわけではないのであくまでもご参考程度なのですが...）

実装していく過程で、どういった歴史的な理由があるのか、最新のブラウザの実装はどうなっているのかといった内容も書かれているので、満遍なくブラウザやWebについて学ぶことができます。

## どんな人におすすめか

**ブラウザの構成要素やそれがどういった実装になっているのかを知りた人にはおすすめできる本**です。自分の手で実装することで理解が進むことは間違いありません。JavaScriptエンジンはライブラリを使っているのですが、自分で実装して置き換えるといった楽しみ方もできると思います。

また、**Webの歴史を知りたい人にもおすすめ**です。著者の二人はWebの黎明期からのユーザーです。そのため、Webの歴史についてもかなり詳しく書かれています。読み物としても面白い部分が多いのが本書の特徴です。

原著はユタ大学や、ワシントン大学、HAW Hamburg（ハンブルク応用科学大学）といった大学の学生の教科書としても使われています（[参考](https://browser.engineering/classes.html#haw-hamburg)）。**Webを題材にした授業の題材を探している方なんかにもおすすめできる本**です。 もしも、本書を学校の授業で使いたい、授業をして欲しいといった相談があれば bokken.ro+github@gmail.com までご連絡いただければサポートできるかもしれません。

## おわりに

以上、Web Browser Engineeringの翻訳本「Webブラウザエンジニアリング」について紹介しました。長く続くプロジェクトだったので日の目を見ることができて嬉しく思っています。
この翻訳が、ブラウザやWebに興味を持つ人が増えるきっかけになれば幸いです。もしも、コメントなどがあればXのアカウント（[@bokken\_](https://x.com/bokken_)）までご連絡ください。
