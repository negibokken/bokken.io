# GitHub permalink の URL の仕様について

@tags: [GitHub, permalink]

@date: [2022-07-31, 2022-07-31]

## はじめに

筆者は VS Code で [GitHub の permalink をコピーできる拡張機能](https://marketplace.visualstudio.com/items?itemName=mattlott.copy-github-url)をよく使っている。

この拡張機能は一部のエンコードが必要な URL についてはサポートされていない。

例えば、下記のような pathname を持つファイルは正しい URL をコピーできない。

```text
/@foo/[bar]/a !"#$%&'()*+,-.:;<=>?@[\]^`{|}~.txt
```

今回はこの URL がどのように生成されているのか調べてみることにした。

## TL;DR

早く知りたい人向けに結論を書く。

* GitHub の permalink は 次のような形式になっている
  * `https://github.com/${owner}/${repository}/${commit_hash}/blob/${path_name}?query=test#L11`
* 上記 URL のうちクエリパラメータ以前の URL について [`encodeURI`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURI) を実行し、`#` を `%23` に、`?` を `%3F` に置換する

    ```javascript
    const encoded = encodeURI(url).replace('#', '%23').replace('?', '%3F')
    ```

* 最後にクエリパラメータとフラグメントとエンコード後の URL と結合する

この調査結果に至るまでの過程について次の節で述べる。

## 調査

まず、GitHub の permalink の基本的な形式は下記のようになっている。

```text
https://github.com/${owner}/${repository}/${commit_hash}/blob/${path_name}?query=test#L11
```

調査をする過程で[github-url-test](https://github.com/negibokken/github-url-test) というリポジトリを作って確認をしていた。そして、GitHub の URL は少し奇妙な規則でURL エンコードされていることに気づいた。よくある encodeURI や encodeURIComponent を単独で利用した場合にエンコードされる URL とは異なる URL になる。

例えば、 ファイル名にある `#` は パーセントエンコードされるが、`!` や `&` 、`'` といった記号はパーセントエンコードされないといった具合だ。

前述したファイルのパスは下記のようにエンコードされる。

```text
/@foo/%5Bbar%5D/a%20!%22%23$%25&'()*+,-.:;%3C=%3E%3F@%5B%5C%5D%5E%60%7B%7C%7D~.txt
```

各記号とそれがどのようにエンコードされるのかをまとめたのが下記の表だ。

| 記号 | GitHub permalink 上の表現 | encodeURI | encodeURIComponent |
| :-: | :-: | :-: | :-: |
| SP | %20 | %20 | %20 |
| ! | ! | ! | ! |
| " | %22 | %22 | %22 |
| # | %23 | # | %23 |
| $ | $ | $ | %24 |
| % | %25 | %25 | %25 |
| & | & | & | %26 |
| ' | ' | ' | ' |
| ( | ( | ( | ( |
| ) | ) | ) | ) |
| * | * | * | * |
| + | + | + | %2B |
| , | , | , | %2C |
| - | - | - | - |
| . | . | . | . |
| / | / | / | / |
| : | : | : | %3A |
| ; | ; | ; | %3B |
| < | %3C | %3C | %3C |
| = | = | = | %3D |
| > | %3E | %3E | %3E |
| ? | %3F | ? | %3F |
| @ | @ | @ | %40 |
| [ | %5B | %5B | %5B |
| \ | %5C | %5C | %5C |
| ] | %5D | %5D | %5D |
| ^ | %5E | %5E | %5E |
| ` | %60 | %60 | %60 |
| { | %7B | %7B | %7B |
| \| | %7C | %7C | %7C |
| } | %7D | %7D | %7D |
| ~ | ~ | ~ | ~ |

但し、URL 末尾に行番号を表すときに付与されるフラグメントの `#` や、クエリパラメータを表す `?` はエンコードされない。
合わせて `/` がファイル名としては使えなかったので、 `/` のままとしている。

上記の表を見てみると、おおむね encodeURI でエンコードされる内容と同じである。
異なっているのは、`#`、`?` のみである。

これは、`#` や `?` がフラグメントやクエリパラメータとして特別な意味を持っているため、ファイル名で使えないためだと考えられる。

## エンコード処理

これらのことから、エンコード前の GitHub の URL を permalink の形式にする処理としては下記のようになるだろう。

```javascript
const encoded = encodeURI(url).replace('#', '%23').replace('?', '%3F')
```

ただし、クエリパラメータや、URL フラグメントがある場合は分離した上で url として渡す必要がある。

なお、GitHub 上のページ遷移で表示されるリンクと permalink の生成とでエンコードされる URL は違うようである。例えば `@` は、permalink 上ではエンコードされないが、GitHub 上のリンクの遷移では `%40` にエンコードされる。

## おわりに

分かってしまうと簡単な規則でパーマリンクが実現されていることが分かった。

普段からお世話になっている [GitHub の permalink をコピーできる拡張機能](https://marketplace.visualstudio.com/items?itemName=mattlott.copy-github-url) にも fix する PR を送ろうと思う。

もしも誤りや、他の permalink 生成の規則とも同一であることが分かった場合は、[@bokken_](https://twitter.com/bokken_) までお知らせしてもらえると嬉しい。
