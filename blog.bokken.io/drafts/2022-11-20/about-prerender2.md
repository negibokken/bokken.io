# Prerender2 という機能について

@tags: [Web, browser, Prerender2]

@date: [2022-11-20, 2022-11-20]

## はじめに

Prerender2 という仕様がある。

なぜ Prerender2 なのか。

なぜ Prerender 取り下げられたのか。

> Prerender is difficult to maintain and wastes resources compared to its performance benefit. More efficient ways to achieve the same performance goal are in development, but as they will behave quite differently from prerender we need to resolve any unknown external dependencies by deprecating prerender cleanly.
>
> -- https://groups.google.com/a/chromium.org/g/Blink-dev/c/0nSxuuv9bBw

大きな理由としては下記のようだ。

* メンテナンスが難しい
* パフォーマンスの恩恵に比べてリソースを消費してしまう
* 別途パフォーマンスを改善するために開発されている NoState Prefetch が prerender に未知の依存を作らないようにする

ここで、メンテナンスが難しいのは Prerender の機能自身のことだと考えられるが、具体的にどの部分がメンテナンスコストを上げているのかは記載がなかった。

ただ、Prerender が [2011年にアナウンスされている](https://blog.chromium.org/2011/06/prerendering-in-chrome.html)機能であり、相当古い機能なのでコードも古くなってメンテナンスが難しくなるのは想像に難くない。

Prerender も NoState Prefetch も `<link rel="prerender">` という形で機能を使うため、いっそのこと削除しようという判断だったのかもしれない。

いずれにしても Prerender は一度こういった背景で取り下げられた。




## 参考文献

1. [P2D: Prerender2 for Desktop - Google Docs](https://docs.google.com/document/d/1EpLshvc9RRW3vswmXsJGrbCkhlFmxDsWfbvgxmYDTfs/edit)
1. [Prerender2 for Desktop - Chrome Platform Status](https://chromestatus.com/feature/5197044678393856)
1. [Prerender2 [public] - Google Docs](https://docs.google.com/document/d/1P2VKCLpmnNm_cRAjUeE-bqLL0bslL_zKqiNeCzNom_w/edit)
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
