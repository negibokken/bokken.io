# Prerender2 のキャッシュを更新し続けるためのヘルパーと HTTP Cache を合わせて活用する方法

@tags: [Prerender2, tips]

@date: [2023-06-30 , 2023-06-30]

## はじめに

本記事ではPrerender2で事前描画したページを更新し続けるときに、少しだけ便利なヘルパーを作ったので、Prerender2の挙動とあわせて紹介する。

## Prerender2 とは

Prerender2 という機能が Chrome/Chromium で実装されている。この Prerender2 という機能は、リンク先のページを事前描画する機能である。リンク先への遷移が一瞬で完了するため、高速な閲覧体験をユーザに提供できる機能だ。

Prerender2 によって、例えば非常に重い画像が複数あるページであっても(事前描画が終わっていれば)一瞬で表示される。その簡単なデモが次の例だ。

<div style="display: flex;">
    <img width="350px" src="./img/prerender2-off.gif">
    <img width="350px" src="./img/prerender2-on.gif">
</div>

最初のデモでは Prerender2を使わずに重い画像を複数掲載しているページにアクセスしている。黒い画像がすべて表示されるのに時間がかかるのが見て取れる。2 つめのデモではPrerender2を使って、遷移先のページを事前描画している。そのため、黒い画像群が一瞬で表示されている。

細かい仕様などは、[web.dev](https://developer.chrome.com/blog/prerender-pages/)の記事を参照していただきたいのと、
本blogでも一度紹介したことがあるため、[こちらの記事](https://blog.bokken.io/articles/2022-11-24/about-prerender2.html)を参照していただきたい。

### Prerender2 の使いどころ

Prerender2が効果を発揮しそうなページとしては下記のようなところがある。

* デモのような非常に重い画像を含むようなページ
* メインスレッドで重い処理をする必要があるページ
* そもそもパフォーマンスを考慮できておらず遅いページ

また、課金・購読に関係したページも早く表示されることによって離脱率が下がる傾向にあるため、これらのページにも使えるだろう。

### Prerender2 の注意点

ただし、Prerender2を使うと CPU、メモリ、ネットワーク帯域幅、データ通信容量などユーザのリソースを消費してしまうため、ありとあらゆるリンク先を Prerender するわけにはいかない。どのページを Prerender するかは [@nhiroki](https://twitter.com/nhiroki_) さんの記事(「[Speculation Rules API によるプリレンダリングのためのメトリクス設計](https://nhiroki.jp/2023/02/13/metrics-for-prerendering)」)を参考に、Prerender2 の Hit Rate などのメトリクスを確認して、本当にPrerender2を使うべき場所なのか？を見定める必要がある。

## Prerender2 のキャンセル

さて、ようやく本記事の主題だが、Prerender2 による事前描画は Speculation Rules を削除することでキャンセルできる。例えば下記のように DOM を削除することで、事前描画されたページは破棄される。

```javascript
const script = document.querySelector('script[type="speculationrules"]');
script.parentNode.removeChild(script);
```

ここで、[web.dev](https://developer.chrome.com/blog/prerender-pages/) には、キャンセルが必要なページに対してはPrerender2 を使わないことが推奨されている。一方で、ページの表示を高速化したいがキャンセルもしたい一定のユースケースは存在していると考えている。

## Prerender2をキャンセルしたくなるユースケース

例えば、web.dev にはメディアサイトやブログの最新記事を Prerender2 の対象にする[例が紹介](https://developer.chrome.com/blog/prerender-pages/#cancelling-speculation-rules:~:text=Statically%20included%20in%20the%20page%27s%20HTML.%20For%20example%20a%20news%20media%20site%2C%20or%20a%20blog%20may%20prerender%20the%20newest%20article%2C%20if%20that%20is%20often%20the%20next%20navigation%20for%20a%20large%20proportion%20of%20users.)されている。

しかし、これらのサイトでは、記事が修正されるようなこともある。また、時間経過とともに記事の内容が変化していくような記事もあるだろう。その他、課金・購読に関するページの料金体系に変更があったときなどは古い料金体系表が表示されてしまうこともある。

このように大部分は Prerender2 で高速化できる可能性があるが、古いページが表示されてしまい困ってしまうこともある。

こういったケースではまず Prerender2 以外の方法で高速化することを考えるべきだが、この記事ではそういった最適化が終わってもなお高速化したいケースを考える。

## 今回のユースケースの問題

今回の問題は、遷移先のページが古くなってしまっていることが問題だと考えられる。そうなると今回の問題に対しては下記のような解決方法がありそうだ。

* 定期的に更新する
* 遷移先のページに更新があったときにリフレッシュする

それぞれ順番に解決方法を考える。

### 定期的に更新する

定期的に Speculation Rules を削除して、新しく Speculation Rules を append することで事前描画をやりなおし、定期的に遷移先ページを更新できる。

例えば5秒ごとに Speculation Rules を更新する場合、コードにすると例えば下記のようになる。

```javascript
<script>
setInterval(() => {
    // 現在の Speculation Rules を取得 (ひとつしかないことを過程)
    const current = document.querySelector('script[type="speculationrules"]');

    // 新しく Speculation Rules 用の script を作成する
    const rule = current.textContent;
    const attributes = current.attributes;
    const newScript = document.createElement('script');
    script.setAttribute("type", "speculationrules");
    for(const attribute of attributes) {
        script.setAttribute(attribute.name, attribute.value);
    }
    newScript.textContent = rule;

    // 古い Speculation Rules を削除する
    const parent = current.parentNode;
    parent.removeChild(current);

    // 10ms 後 (これは仮置き) に新しい Speculation Rules を append する
    setTimeout(() => { parent.appendChild(script); }, 1 * 10)

    current= newScript;
}, 5 * 1000);
</script>
```

ここで、scriptを新しく作り直しているのは、同じDOMの場合はPrerender2が再度実行されなかったためだ。おそらく同じ参照を持つDOMでは再実行されないようになっているのだろう。

上記のような script を使えば、定期的にSpeculation Rulesを更新し、遷移先のページの内容も定期的に更新できる。

### 定期的に更新するためのヘルパー

これを簡単にするための [ヘルパー](https://github.com/negibokken/prerender2-refresh-helper) を用意したので使ってみてほしい。

使い方としては、下記のように script を読み込み、`speculationrules` に `data-prerender-refresh="${seconds}"` と書くだけだ。

```html
<script src="https://cdn.jsdelivr.net/gh/negibokken/prerender2-refresh-helper@0.0.2/dist/index.js"> </script>
<script type="speculationrules" data-prerender-refresh="5">
{
  "prerender": [
    {
      "source": "list",
      "urls": ["page.html"]
    }
  ]
}
</script>
```

こうすることで、`${seconds}` 間隔で Speculation Rules を更新してくれる。

### HTTP Cache を活用して更新があったときのみキャッシュを更新する

さて、話がそれてしまったが、定期的に Prerender2 で事前描画されるページを更新する方法をさらに最適化することを考える。

Prerender2 で事前描画する際には、HTTP Cache を尊重してくれる。
例えば、`pageA.html` に `Cache-Control: max-age=3600;`が指定されており、既に取得済みであるとする。すると、3600 秒間はそのキャッシュを利用して事前描画してくれる (`Expires` による指定でも同様の挙動になる。)。

そのため、定期的に事前描画を走らせていても、`Cache-Control: max-age=n;` が設定されていて Cache が有効な場合はブラウザのキャッシュが利用されるためサーバへの負荷にはならない。

また、レスポンスに `Last-Modified` や `ETag` を指定しつつ、クライアントから `If-Modified-Since` や `If-None-Match` を用いたコンディショナルリクエストによって再検証する。そうすることでリソースに更新があったときだけ、リソースが返却されるようになるため、クライアントとサーバの負荷を最低限にできる。

### HTTP Cache を活用する際の注意

Prerender2による事前描画が行われたページはキャッシュの有効期限が切れたとしてもページ自身は破棄されない。
そのため、意図しないページが描画される可能性がある。**HTTP Cache と Prerender2 は異なるライフサイクルを持つ**ことに注意して活用を検討してみるとよいだろう。

## おわりに

今回、Prerender2 で事前描画したページが古くなってしまったときに対応する方法について検討してその対応方法を紹介した。

今回紹介したライブラリを使えば比較的かんたんに Prerender2 で事前描画したページを新しい状態に保ち続けることができる。もしも活用できるようであれば利用してほしい。

また、このライブラリを使うだけではなく、HTTP Cache と合わせて使うことでさらに最適化できるのでそれと合わせて検討してみていただきたい。

もしも、誤りや補足の情報があれば [issue](https://github.com/negibokken/bokken.io/issues) や [@bokken_](https://twitter.com/bokken_) までいただけると嬉しい。

## 参考リンク

* [Prerender pages in Chrome for instant page navigations - Chrome Developers](https://developer.chrome.com/blog/prerender-pages/)
