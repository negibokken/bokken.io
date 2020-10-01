# HTML parser を書いてるときに出会った Web 標準仕様の話

@tags: [html,tag,parser,Web 仕様]

@date: [2020-10-02, 2020-10-02]

## TL;DR

筆者はブラウザをスクラッチで書いている。そのときに HTML の標準を読みながらブラウ
ザを書いている

そのときに仕様の不備のように疑われる挙動に出会った。

内容について調査しているうちに

- Web は標準を壊さないようにしている
- 動いているものが Web

ということを再認識できたので、その内容について紹介したい。

## 出会った背景

まず、筆者がどういう背景でどのような挙動に出会ったかを簡単に紹介する。

筆者はブラウザに興味があり、ブラウザをフルスクラッチで作っている。

その中で HTML の parser を
[WHATWG の仕様](https://html.spec.whatwg.org/multipage/parsing.html) を読み解き
ながら実装している。

そのときに、attribute (`<a href="https://example.com"></a>`の `href` などの部分)
の parse 処理を実装しているときに出会った。

### HTML タグの attribute の書き方

HTML タグの attribute value は `double-quoted`,`single-quoted`,`unquoted` が許さ
れている。

つまり、下記の三種類の書き方ができる。

```html
<a href="https://example.com"></a>
```

```html
<a href="https://example.com"></a>
```

```html
<a href=https://example.com></a>
```

この仕様に沿って parser を書いてると、どうも anchor タグのテストが通らないという
事象に出会った。

そのときのテスト入力には下記のように書いていた。

```html
<a href=https://example.com/></a>
```

URL の末尾に `/` を書き、さらに属性値の `'` や `"` を省略している状態だ。

このときに実装していた HTML parser ではどのように解釈されていたかをかいつまんで
説明すると下記である。

1. a タグの開始
1. href という attribute name がある
1. attribute の value は `https://example.com` (`/` は次で使われる)
1. a タグは self closing `/>`
1. a タグの閉じタグが余っている (`</a>`)

という具合に処理されて、`</a>` が浮いてしまい、テストが落ちていたのだっ た

WHATWG の仕様には沿っているし、URL としては `https://example.com/` と書いていて
も問題なさそうだ。

これの挙動については、なにか議論ができるかもしれないと思い、issue を立ててみるか
と思い立ったのだった。

このあと分かったことだがこの挙動は Web として正しい。

## issue の調査

WHATWG/html の issue を調査をしてみると、すでに似たようなことについては
[[Parser] Make \`/\` in unquoted attribute value a parse error\. · Issue \#2665 · whatwg/html](https://github.com/whatwg/html/issues/2665)
で議論がなされていた。

この issue では、この挙動への変更について @hsivonen 氏は下記のように述べて、変更
をしない方が良いということを述べている。

> If we now recanted on this, we'd undermine the WHATWG's credibility as source
> of reliable requirements than don't change on whim and that don't need
> "defensive coding" in case they change. If we now changed this, we'd vindicate
> the story that you should always do something extra (quotes, end tags), just
> in case, because you never know how things work out if you do something easy
> and convenient and you can't trust things to actually work the way specs say.

簡単に要約すると、下記のようだった。

- WHATWG の信頼性を損なってしまう
- WHATWG の仕様が変更されるとなると、仕様の変更を常に念頭においてコーディングし
  なければいけない
- WHATWG の仕様に記載されている通り動いているものも信用ができなくなる

確かにこの仕様を変更するだけで、いくつのソフトウェアが書き直されるかわからないし
、この挙動を前提として書かれたウェブページもあるかもしれない。

そういう状況では仕様を変更することにはかなりの危険が伴うのだ。

## おわりに

WHATWG の[標準の変更に対する考え](https://whatwg.org/faq#change-at-any-time)にも
変更はとても慎重になることが書かれている。

また、団体が少し変わるが W3C
の[後方互換性に関する説明書き](https://www.w3.org/People/Bos/DesignGuide/compatibility.html)
にも下記のように述べられている。

> The Web itself is designed to be backwards compatible.

Web というのはとても互換性を大切に作られてきている。また、実際に動くものを重視し
ているのも間違いない。

少なくとも標準化までに、仕様の提案、各ベンダによる実装、仕様の改善がなされてはじ
めて標準として成立して、今 Web は動いている。

よほどのことがない限り、今動いているものが正義なのだ。

それをより身近に感じられた出来事だった。

この Web 、あるいはインターネットを壊さないように、改善するためにどうするかをコ
ミュニティのメンバー全体で作られている感覚が筆者にはとても心地よく感じられる。
