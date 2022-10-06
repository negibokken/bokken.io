# Anonymous iframe とは (WIP)

@tags: [iframe, spec]

@date: [2022-09-27, 2022-09-27]

## はじめに

[Anonymous iframe](https://wicg.github.io/anonymous-iframe/) という仕様がある。
この仕様が何を問題意識として、何を解決するための仕様なのかをまとめる。

## tl;dr

Anonymous iframe は COEP (Cross Origin Embedder Policy) require-corp 環境下で外部リソースの利用が制限された状態あっても、安全な形で iframe を利用するための仕様である。

親から iframe でサイトを埋め込もうとすると、は iframe 内のサイトにも COEP が指定されている必要がある。

サードパーティのサイトである場合、COEP を指定してもらうことが難しいか、あるいは時間がかかるため、自分のサイトで COEP を指定しようとしても、iframe を利用したいがために COEP 指定できないことが起こりうる。

これを COEP 指定下であっても iframe を利用できるようにするための仕様が Anonymous iframe である。

## Cross Origin Embedder Polidy (COEP)

COEP については、[@agektmr](https://web.dev/coop-coep/) さんの[このページ](https://web.dev/coop-coep/)が詳しい。

要するに Spectre などの CPU の脆弱性を突いてプライベートな情報を盗み取るような攻撃を防ぐために、安全な外部リソースの読み込みのみに限定し、安全とは言いきれない外部リソースからの読み込みを防ぐための仕様であると言える。

COEP には、unsafe-none (デフォルト値) か require-corp (CORP による指定が必要) を指定できる。

```http
Cross-Origin-Embedder-Policy: unsafe-none | require-corp
```

require-corp を指定すると、 Cross Origin Resource Policy でリソースの読み込みポリシーを定義する。
ここには、same-site のリソースのみ、same-origin のリソースのみ、cross-origin でも読み込みができる、という 3 つが指定できる。

```http
Cross-Origin-Resource-Policy: same-site | same-origin | cross-origin
```

## Anonymous iframe 詳解


T.B.W.
