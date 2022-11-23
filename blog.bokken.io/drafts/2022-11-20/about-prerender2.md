# Prerender2 という機能について

@tags: [Web, browser, Prerender2]

@date: [2022-11-23, 2022-11-23]

## はじめに

Prerender2 という機能の実装が進んでいる。この機能はページのレンダリングを予め行うことでページを高速に閲覧できるようにするための機能だ。この記事ではなぜ Prerender**2** なのか、どうすれば適用できるのか、使う際の注意点はなにかを 2022/11/23 時点での情報についてまとめる。最新の情報については、それぞれの文書を参照されたい。

## Legacy Prerender

Prerender は Rendering を予め行い、ユーザのリンククリック時にあらかじめレンダリングされた結果を表示することで、閲覧体験を向上させる機能といえる。

近年開発が進んでいるのは Prerender2 という機能だ。過去に Prerender という機能が実装されていたが、それとは別物になる。この記事では読みやすさのために Prerender2 を Prerender2、過去の Prerender を Legacy Prerender と呼称することにする。

現在 Legacy Prerender は機能としては提供されておらず、取り下げられている。なぜ Legacy Prerender は取り下げられたのか。それについては、Prerender の [Intent to Deprecate and Remove: Prerender](https://groups.google.com/a/chromium.org/g/Blink-dev/c/0nSxuuv9bBw) の投稿に下記のように書かれている。

> Prerender is difficult to maintain and wastes resources compared to its performance benefit. More efficient ways to achieve the same performance goal are in development, but as they will behave quite differently from prerender we need to resolve any unknown external dependencies by deprecating prerender cleanly.

* メンテナンスが難しい
* パフォーマンスの恩恵に比べてリソースを消費してしまう
* 別途パフォーマンスを改善するために開発されている NoState Prefetch が prerender に未知の依存を作らないようにする

ここで、メンテナンスの難しさについては、[WICG/nav-speculation](https://github.com/WICG/nav-speculation/blob/main/triggers.md#general-interop-and-compat-concerns) に少し関連していそうな記載がある。

> Current implementations are also not necessarily compatible with storage partitioning, as they were designed before such efforts. So there may need to be future backward-incompatible changes to them to meet browser teams' new goals around privacy.

現在の実装 (`<link rel="prerender">` ) は storage partitioning との互換性が必要ないときに設計されたため、現在のプライバシーゴールに到達していないという記載がある。この部分は `<link rel="prerender">`、つまり NoState Prefetch についての記載であるが、おそらく NoState Prefetch 以前の機能である Legacy Prerender についても同様なことが予想される。Legacy Prerender が [2011年にアナウンスされている](https://blog.chromium.org/2011/06/prerendering-in-chrome.html)機能であることから、コードが古くなっていて、上記のゴールを達成するためのメンテナンスが難しくなっているのは想像に難くない。

いずれにしても Legacy Prerender は一度こういった背景で取り下げられた。

## Prerender2

2017 年に Intent to Deprecate and Remove: Prerender が出てから 4 年の月日が流れ、2021年 8 月に Prerender2 の仕様に関する文書が作成された。
[Prerender2 のドキュメント](https://docs.google.com/document/d/1P2VKCLpmnNm_cRAjUeE-bqLL0bslL_zKqiNeCzNom_w/edit#heading=h.gfguuhafev5j)には下記のようにある。

> ## What’s about “2”, or why are we resurrecting it?
>
> * We used to have prerendering, but turned it down, and are creating a new one.
> * We think we can bring it back without the problems **of** the past.

過去の Prerender を取り下げた当時の問題を今なら解決できるということらしい。
Legacy Prerender の実装がなくなったり、リファクタを重ねた結果、Prerender2 をモダンな形で実装できるようになったのだろう。
Chromium の Commit を見ても、Legacy Prerender の削除や、Refactor、Prerender2 の実装が行われているのが[伺える](https://chromium-news.vercel.app/?query=Prerender)。

### Triggering

ここまで、Prerender2 の歴史について主に触れてきたが、次節からは Prerender2 をどのように使うのかを紹介する。

Prerender2 の有効化は比較的簡単で [Speculation Rules](https://wicg.github.io/nav-speculation/speculation-rules.html)を用いて行われる。
具体的には次のようになる。

```html
<script type="speculationrules">
{ prerender: [{ source: 'list', urls: ['next.html'] }] }
</script>
```

簡単なデモページを用意した。

### 検討事項

> CSP
> Interaction with CSP is discussed in the prerendering browsing context section of the explainer. See also a spec issue for more discussion.
> In summary, relevant CSP directives of the triggering page can restrict the main resource request for prerendered pages. But once a prerendered page is committed, it has its own CSP which restricts subresource requests.
> Some relevant directives are navigate-to and prefetch-src. These restrict which URL can be prerendered, including redirects (with the exception of `unsafe-allow-redirects`).
> navigate-to is not yet implemented in Chromium or shipping (see discussion thread). Currently prerendering does not respect the directive.
> prefetch-src support for prerendering has been implemented. We do not allow prerendering upon a request/redirect that violates the directive.
> Also, as speculationrules is a &lt;script&gt;, it needs to respect script-src. This is not yet implemented but it might just work as-is. It is tracked at GitHub and crbug. We do not believe this blocks the origin trial.
> Other directives on the triggering page that were considered but will not have an affect on the prerendering page are:
> connect-src: This doesn’t affect <link rel=prerender> today, so will not affect Prerender2.
> frame-src: This is about subframes in a document, and should not be propagated from the triggering page to the prerendered page.

### Privacy considerations

あるページにアクセスしたときユーザが意図せず別のページを訪問することになる。
same-origin であれば問題ない。

cross-origin の場合については検討が進んでいる。
2022/11/23 現在では same-origin Prerender2 のみが有効であり、cross-origin については今後議論が進んでいくことだろう。
https://github.com/WICG/nav-speculation#cross-origin-and-cross-site-concerns

### ネットワークリクエストと Cookie について

https://docs.google.com/document/d/1P2VKCLpmnNm_cRAjUeE-bqLL0bslL_zKqiNeCzNom_w/edit#bookmark=id.vbnic8jwys3e

> The plan is for the prerendering page to have mostly unrestricted access to network, including having cookies present on the requests.
> This includes for cross-origin subresource requests. While third-party cookies are a known privacy concern, there is ongoing other work in Chromium to reduce the privacy risk of these that we expect to be automatically applied to prerendering. But it is worth noting that that work will likely only restrict cross-site cookies, and not cross-origin ones. Nevertheless, the same-origin prerender does not give the main page any more power to make cross-origin requests than it can already do with an iframe.
> One restriction in prerendering is that cross-origin iframes will delay loading until activation. This improves privacy and simplifies cross-process concerns (there are no out-of-process iframes), but it can limit the effectiveness of prerendering if essential content for the page is in the iframe.

プリレンダリングにおける一つの制限は、クロスオリジンのiframeは起動するまで読み込みを遅らせるということです。これはプライバシーを向上させ、クロスプロセスに関する問題を単純化しますが


### HTTP Cache について

HTTP Cache は Prerender されると通常のリクエストと同様に HTTP Cache が更新される。
これは NoState Prefetch と同じだが、将来的には分離された一時的な Cache を利用するか、PrefetchCache のように 5 分でタイムアウトするようにすることが目標とのこと。

#### 注意点

`<link rel="prerender">` という形では NoState Prefetch が働くだけで、Prerender2 はトリガーされない。

* `<link rel="prerender">` の挙動を変えるのはリスクであること
* speculationrules はもっとパワフルで柔軟な API になることが想定されている
* Prerender2 がトリガされるのか、NoState Prefetch がトリガされるのか説明が複雑になる



Prerender2 では `target_hint` という形で hint を指定する。

```
<script type=speculationrules>
{
  "prerender": [****{
    "source": "list",
    "target_hint": "_blank"****,
    "urls": ["page.html"]
  }]
****}
</script>
<a target="_blank" href="page.html">click me</a>
```

新しいタブで開いたときはどうなるのか。


> Note that if a page is truly unsure whether a given URL will be prerendered into the current window or a new one, they could include prerendering rules for multiple target windows:
>
> ```json
> {
>   "prerender": [
>    {"source": "list",
>     "target_hint": "_self",
>     "urls": ["page.html"]
>    },
>    {"source": "list",
>     "target_hint": "_blank",
>     "urls": ["page.html"]
>    }]
> }
> ```
>
> However, in implementations such as Chromium that need the target hint, this will prerender the page twice, and thus use twice as many resources. So this is best avoided if possible.

最後に記載があるように、リソースを二倍消費することになるため、できれば避けたほうが良い。

### feature detection

If the browser supports HTMLScriptElement's supports(type) static method, HTMLScriptElement.supports('speculationrules') will return true.

```javascript
if (HTMLScriptElement.supports && HTMLScriptElement.supports('speculationrules')) {
  console.log('Your browser supports speculationrules.');
}
```

### API の利用の制限

[Restrictions on prerendered content - Google Docs](https://docs.google.com/document/d/1zY15k_wFTik2EoxBf3_RT7YjYpFMDaeNspy15n0rtww/edit)

[Prerendering Revamped](https://wicg.github.io/nav-speculation/prerendering.html#intrusive-behaviors)

## 参考文献

1. [P2D: Prerender2 for Desktop - Google Docs](https://docs.google.com/document/d/1EpLshvc9RRW3vswmXsJGrbCkhlFmxDsWfbvgxmYDTfs/edit)
1. [Prerender2 for Desktop - Chrome Platform Status](https://chromestatus.com/feature/5197044678393856)
1. [Prerender2 [public] - Google Docs](https://docs.google.com/document/d/1P2VKCLpmnNm_cRAjUeE-bqLL0bslL_zKqiNeCzNom_w/edit)
1. [nav-speculation/triggers.md at main · WICG/nav-speculation](https://github.com/WICG/nav-speculation/blob/main/triggers.md)
1. [Restrictions on prerendered content - Google Docs](https://docs.google.com/document/d/1zY15k_wFTik2EoxBf3_RT7YjYpFMDaeNspy15n0rtww/edit)


1. [Resource Hints](https://www.w3.org/TR/resource-hints/)
1. [Private Prefetch Proxy と Speculation Rulesによるprefetch/prerender](https://blog.araya.dev/posts/2021-08-12/speculation-rules-prefetch.html)

---

1. [Chrome Prerendering](https://www.chromium.org/developers/design-documents/prerender/)
1. [Chromium Blog: Prerendering in Chrome](https://blog.chromium.org/2011/06/prerendering-in-chrome.html)
1. [Intent to Deprecate and Remove: Prerender](https://groups.google.com/a/chromium.org/g/Blink-dev/c/0nSxuuv9bBw)
1. [ link-type-prerender | HTML Standard](https://html.spec.whatwg.org/multipage/links.html#link-type-prerender)

---

1. [NoState Prefetch - Google ドキュメント](https://docs.google.com/document/d/16VCYGGWau483IMSxODpg5faZny1FJ6vNK2v-BuM5EhU/edit#heading=h.uajrcfabdbg5)
1. [Introducing NoState Prefetch - Chrome Developers](https://developer.chrome.com/blog/nostate-prefetch/)
1. [No State Prefetch - Chrome Platform Status](https://chromestatus.com/feature/5928321099497472)
