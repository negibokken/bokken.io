# Chromium の開発時に便利な Visual Studio Code の機能拡張を作った

@tags: [Chromium, Visual Studio Code]

@date: [2022-05-21, 2022-05-21]

## 概要

Chromium の開発をしているときに、他の人にコードのどの部分かを説明したいことがある。

そんなときに GitHub では、[Copy GitHub URL](https://marketplace.visualstudio.com/items?itemName=mattlott.copy-github-url)というプラグインで、VS Code で編集しているコードのパーマリンクを取得できるため、このパーマリンクを共有すればよい。

ただ、Chromium は [Chromium Code Search](https://cs.chromium.org/) で主に管理されており、Chromium Code Search のパーマリンクがほしい。今回はそのためのプラグインを作った。

## デモ

デモは下記である。

![デモ](./sample.gif)

このプラグインでできることはシンプルで、「ランチャーから、選択した行について Chromium Code Search 上でのパーマリンクを生成する」だけである。

ブランチがきちんと考慮される点や、複数行選択もできることが気に入っているポイントである。

## おわりに

このパーマリンクを作ることで、crbug や、GSoC のプロポーザルを書く際([前記事](https://blog.bokken.io/articles/2022-04-30/apply-google-summer-of-code.html))にコードの該当箇所を説明するのにとても役に立った。

Chromium へのコントリビューションを考えている方がいたらぜひ使ってみてほしい。

もし不具合があったり、Windows での動作確認ができたら [@bokken_](https://twitter.com/bokken_) にメンションするか、[リポジトリ](https://github.com/negibokken/chromium-code-search-permalink-vscode-extension)の issue に登録してもらえると嬉しい。
