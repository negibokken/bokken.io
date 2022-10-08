# Anonymous iframe とは (WIP)

@tags: [iframe, spec]

@date: [2022-09-27, 2022-09-27]

## はじめに

[Anonymous iframe](https://wicg.github.io/anonymous-iframe/) という仕様がある。
この仕様が何を問題としていて、何を解決するための仕様なのかをまとめる。

## tl;dr

Anonymous iframe は COEP (Cross Origin Embedder Policy) require-corp 環境下で外部リソースの利用が制限された状態あっても、安全な形で iframe を利用するための仕様である。

親から iframe でサイトを埋め込もうとすると、iframe 内のサイトにも COEP が指定されている必要がある。

サードパーティのサイトである場合、COEP を指定してもらうことが難しいか、あるいは時間がかかることがある。そのため、自分のサイトで COEP を指定しようとしても、サードパーティのサイトを iframe で利用したいがために、自分のサイトで COEP 指定できないことが起こりうる。

これを COEP 指定下であっても iframe を利用できるようにするための仕様が Anonymous iframe である。

## Cross Origin Embedder Polidy (COEP)

COEP については、[@agektmr](https://web.dev/coop-coep/) さんの[このページ](https://web.dev/coop-coep/)が詳しい。

要するに Spectre などの CPU の脆弱性を突いてプライベートな情報を盗み取るような攻撃を防ぐために、安全な外部リソースの読み込みのみに限定し、安全とは言いきれない外部リソースの読み込みを防ぐことで、リスクを減らすための仕様であると言える。

ここでいう外部リソースは、iframe や script、img、ポップアップなどを含んでいる。

COEP ヘッダには、unsafe-none (デフォルト値) か require-corp (CORP による指定が必要) を指定できる。

```http
Cross-Origin-Embedder-Policy: unsafe-none | require-corp
```

require-corp を指定すると、 Cross Origin Resource Policy (CORP)ヘッダでリソースの読み込みポリシーを定義する。
ここには、same-site のリソースのみ、same-origin のリソースのみ、cross-origin でも読み込みができる、という 3 つが指定できる。

```http
Cross-Origin-Resource-Policy: same-site | same-origin | cross-origin
```

credentialless という機能が実装されている。
https://chromestatus.com/feature/4918234241302528

これは（ドキュメント｜リソース）への読み込みのリクエストについてクレデンシャルを含まないようにすることで、
パブリックなリソースしか読み込まないようにするための機能である。そうすることで、たとえ攻撃者がドキュメントの情報を窃取しようとしても表示されている内容はパブリックな情報のみなので攻撃されたときのリスクを下げることができるというものだ。


## Anonymous iframe 詳解

```html
<iframe anonymous src="https://example.com">
```

COEP でブロックされないようにするためには、下記のように crossorigin attribute を指定する。

```
<img src="https://third-party.example.com/image.jpg" crossorigin>
```
