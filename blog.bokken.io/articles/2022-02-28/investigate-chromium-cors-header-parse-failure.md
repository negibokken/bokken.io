# Chromium のバグを直しているときに知った HTTP ヘッダ関連の Web 標準の読み方

@tags: [Chromium, Web 標準, Fetch]

@date: [2022-02-28, 2022-02-28]

## はじめに

最近、Chromium へのコントリビューション活動をしている。
直近で Chromium のバグ fix のために仕様を読んでいて面白いなと思ったことがあったので共有したい。

## TL;DR

- HTTP ヘッダの値のパース方法は各ヘッダごとに決められている。
- 具体的には Structured Field Values for HTTP (RFC8941) か、それぞれのヘッダごとに定義されている ABNF (RFC 7230) を使う。
- Structured Field Values for HTTP は 2021年2月に RFC が出ていて比較的新しいので、こちらを使うのが正しいと思ったが、CORS 関連の仕様を読むと CORS 用の ABNF を参照するのが正しかった
- Structured Field Values for HTTP のパース方法は厳密だが、ABNF はレガシーシステムへの対応も加味されていて比較的緩い
- 仕様を注意深く読むことが大事


## 背景

具体的に取り組んでいたのは、[こちらのバグ](https://bugs.chromium.org/p/chromium/issues/detail?id=978146)である。

内容は `Access-Control-Expose-Headers` に関する Web Platform Test のうち、 `Access-Control-Expose-Headers` の値がうまくパースできておらず、Expose されないというものだった。

具体的な WPT のテストケースは下記のケースだ。

```json
{
  "input": "Access-Control-Expose-Headers:\r\nAccess-Control-Expose-Headers: bb-8",
  "exposed": true
},
{
  "input": "Access-Control-Expose-Headers: ,bb-8",
  "exposed": true
},
```

今回、特に取り上げたいのは2番目のケースである。
この WPT では、ヘッダとして input を使って CORS request をした際に、 bb-8 というヘッダがリクエストに付与されているかどうか (exopsed) をテストするものでだった。
こちらの二番目のケースは exposed が true にも関わらず expose されていなかった。

ただし、WPT が誤っているケースもありえる。今回のバグ対応では WPT が間違っているのか、Chromium の実装が間違っているのかを判断する必要があった。


## 調査

結論からいうと、WPT は間違っておらず、Chromium の実装の一部に問題があった。
ただし一部混乱する部分があった。

Fetch Standard を読むと、[2.2.2 Headers](https://fetch.spec.whatwg.org/#concept-header-list-get-structured-header) のはじめには Structured Field Values をパースをする方法が記載されている。

Structured Field Values for HTTP の場合は厳格なパースが求められ、今回の , bb-8 のような不正な value を認めない。もともとヘッダを構造化してパース方法を統一、厳格化しようとして生まれたのでこういった値を弾くのは当然だろう。今回の WPT の FAIL も Structured Field Values を使うようになったのに、追従できていないのではないか？と誤解してしまった。

しかし、実際にはヘッダの Field Values のパース方法は各ヘッダの仕様ごとに策定されている。
今回の Access-Control-Expose-Headers の場合には、[Fetch Standard](https://fetch.spec.whatwg.org/#http-new-header-syntax) に CORS の ABNF を参照するのが正しいと記載されており、内容としては下記のように #field-name というように定義されている。

```http
Access-Control-Request-Method    = method
Access-Control-Request-Headers   = 1#field-name

wildcard                         = "*"
Access-Control-Allow-Origin      = origin-or-null / wildcard
Access-Control-Allow-Credentials = %s"true" ; case-sensitive
Access-Control-Expose-Headers    = #field-name
Access-Control-Max-Age           = delta-seconds
Access-Control-Allow-Methods     = #method
Access-Control-Allow-Headers     = #field-name
```

`#` という記号については、１つ以上の value のリストを表しており、`field-name` は `token` として定義されている。また、`token` は `1*tchar` 、`tchar` は下記のように定義されている。

```text
token          = 1*tchar

tchar          = "!" / "#" / "$" / "%" / "&" / "'" / "*"
                / "+" / "-" / "." / "^" / "_" / "`" / "|" / "~"
                / DIGIT / ALPHA
                ; any VCHAR, except delimiters
```

これを確認すると、`,` が最初に来るような文字列については、パースが  FAIL し、値が expose されないのが正解であるかのように見える。

だが、実際には [# に関する拡張ルール](https://datatracker.ietf.org/doc/html/rfc7230#section-7)を注意深く読む必要がありる。この仕様を読むと古い list rule との互換性のために、リストにある空白の要素は受領し、無視しなければいけないという記載がある。

> For compatibility with legacy list rules, a recipient MUST parse and  ignore a reasonable number of empty list elements:

今回の問題としては、`Access-Control-Expose-Headers` をパースする際にこの部分を考慮しきれていなかったことが問題だった。こうした仕様による裏付けが取れたため、WPT の修正ではなく Chromium の実装の修正に取り組むことができた。

結果としてこの [CL](https://chromium.googlesource.com/chromium/src/+/f04938e02551c56a0363fca50d49fe97b0c9098f) を作成し、現在はマージされている。成果として、今まで Chromium が FAIL していた WPT がパスするようになった。Web をより良くできたような気がして、とても嬉しい気持ちになった。

## 最後に

WPT は必ずしも正しいとは限らないので仕様を読むことは大切。仕様を読む上では大元（今回でいうと CORS 関連ヘッダの定義と ABNF ルール）からたどっていくことが大事だと身にしみて分かった。
