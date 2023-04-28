# Web サイトのパフォーマンスを計測するためのタイミング関係の API について

@tags: [Browser, Timing API, Performance]

@date: [2023-03-23, 2023-03-23]

## はじめに

Web サイトのパフォーマンスを計測するための API がいくつか提供されている。

ユーザ体験を向上させるのはもちろん。
Google は Core Web Vitals を検索エンジン上で考慮すると述べている。

このことから Web サイトのパフォーマンスを把握するのは非常に重要であるといえる。

## API はどういう考え方でパフォーマンスの情報を提供しているか

Performance Observer が定義されている。
こちらの Performance Observer に計測したいメトリクスを定義することで、そのメトリクスを Observe して知らせてくれる。

これまではこういう方法で提供される API もあったようだが、今後の API はすべて Perfformance Observer を介して監視することになるようだ。

この Performance Observer を使えば、例えば次のような形でパフォーマンスメトリクスを監視し、メトリクスの保存場所へ送ることになるだろう。

```javascript
const observer = new PerofmranceObserver((entry) => {
    sendToMetricsServer(entry);
}, ["foo-bar])
```


## 現在策定されている指標

Performance Observer で監視できるものは Performance Entry と呼ばれており、 [Timing Entry Names Registry](https://w3c.github.io/timing-entrytypes-registry/) によると、現状 Performance Entry には次の 11 種類の type が存在している。 それぞれ 2023 年 4 月 25 日現在の主要 3 ブラウザ が API の対応状況は次の表のようになっている。


|entryType Identifiedr | Interface Type | Chrome | Firefox | Safari |
|:-:|:- | :-:|:-:|:-:|
| mark | [PerformanceMark](https://www.w3.org/TR/user-timing-2/#dom-performancemark) | o | o | o |
| measure | [PerformanceMeasure](https://www.w3.org/TR/user-timing-2/#dom-performancemeasure) | o | o | o |
| navigation | [PerformanceNavigationTiming](https://www.w3.org/TR/navigation-timing-2/#dom-performancenavigationtiming) | o | o | o |
| resource | [PerformanceResourceTiming](https://www.w3.org/TR/resource-timing-2/#dom-performanceresourcetiming) | o | o | o |
| longtask | [PerformanceLongTaskTiming](https://www.w3.org/TR/longtasks-1/#performancelongtasktiming) | o | x | x |
| paint | [PerformancePaintTiming](https://www.w3.org/TR/paint-timing/#performancepainttiming) | o | o | o |
| element | [PerformanceElementTiming](https://wicg.github.io/element-timing/#performanceelementtiming) | o | x | x |
| event | [PerformanceEventTiming](https://www.w3.org/TR/event-timing/#performanceeventtiming) | o | o | x |
| first-input | [PerformanceEventTiming](https://www.w3.org/TR/event-timing/#performanceeventtiming) | o | o | x |
| layout-shift | [LayoutShift](https://wicg.github.io/layout-instability/#layoutshift) | o | x | x |
| largest-contentful-paint | [LargestContentfulPaint](https://www.w3.org/TR/largest-contentful-paint/#largestcontentfulpaint) | o | x | x |

これらの API を使えば Core Web Vitals も計測できるようになる。例えば、 Largest Contentful Paint は次の様な形で取得できる。

```javascript
TODO: Largest Contentful Paint の例
```

より厳密に計測したい場合は [web-vitals](https://github.com/GoogleChrome/web-vitals) を参考にすると良いだろう。

## デモ

Performance Entry を確認するために[デモサイト](https://x.bokken.io/example-performance-entry/index.html)を用意した。上記の Performance Entry をすべて確認できるようになっている (一部操作が必要)。

次のような形で Performance Entry が取得できているのが分かる。

![デモ](https://placehold.jp/800x350.png)


### 新しく追加されているエントリの種別

ここまで [Timing Entry Names Registry](https://w3c.github.io/timing-entrytypes-registry/) で紹介されている Performance Entry を紹介したが、[Timing Entry Names Registry](https://w3c.github.io/timing-entrytypes-registry/) は 2021 年 2 月から更新がされていない。
現状、新しくエントリが増えていないのか、Chrome の DevTools の console で `PerformanceObserver.supportedEntryTypes` を実行したところ、あたらしく 3 つのエントリ (`back-forward-cache-restoration`、`soft-navigation`、`visibility-state`) が追加されていることを確認できた。


```
PerformanceObserver.supportedEntryTypes
> (14) ['back-forward-cache-restoration', 'element', 'event', 'first-input', 'largest-contentful-paint', 'layout-shift', 'longtask', 'mark', 'measure', 'navigation', 'paint', 'resource', 'soft-navigation', 'visibility-state']
```

これらは Chromium ベースのブラウザでのみ利用できるようだが、これらについても少しだけ紹介しておく。

##

PerformanceEntry

back-forward-cache-restoration, soft-navigation, visibility-state について

- back-forward-cache-restoration
    - https://github.com/w3c/performance-timeline/issues/182
    - https://chromium-review.googlesource.com/c/chromium/src/+/3714558
- soft-navigation
    - https://developer.chrome.com/blog/soft-navigations-experiment/
    - https://github.com/WICG/soft-navigations/issues/14
- visibility-state
    - https://chromestatus.com/feature/5683502144028672
    - https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API
    - https://webplatform.github.io/docs/dom/Document/visibilityState/
    - 直近で Intent to Ship が出された https://groups.google.com/a/chromium.org/g/blink-dev/c/LA8HTx6tCKY/m/6VkL0jxtAQAJ

## その他

これまで紹介した API は比較的簡単に Performance 情報を取得できる。
その他にも Chromium ベースのブラウザの場合は `${browse識別子}://tracing/` にアクセスすることで、より詳細なパフォーマンスの情報を取得できる。こちらはよりブラウザの詳細な実行状況を取得できるため情報量は多い。

## おわりに

ここまでパフォーマンスの計測ができる各種 API についてまとめて、対応状況等と合わせて紹介した。
Performance Observer によって一箇所に Performance 系のエントリがまとめて入ってくる API は拡張しやすそうに感じた (実際に続々と追加されていそうだ)。

一方で、これらの Perfromance Entry の扱いには少しクセがあり、BFCache によって restore されたのか、Prerender2 による navigation かなどによって、各エントリの情報を加工して使う必要がある。そのためにはブラウザについて深い理解が必要だろう。RUM (Real User Monitoring) を提供しているサービスのすごさが少し理解できたように感じる。

今後も Web Vitals は増えていき、その分だけ Performance Entry は増えていくが、基本を理解していればそれほど戸惑わなくても済みそうだ。この記事がその一助になれば嬉しい。

もしも、誤りや追加の情報があれば [issue](https://github.com/negibokken/bokken.io/issues) や [@bokken_](https://twitter.com/bokken_) までいただけると嬉しい。

## 参考資料・リンク

1. [Web Performance Working Group](https://www.w3.org/webperf/)
2. [PerformanceEntry.entryType - Web APIs | MDN](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceEntry/entryType)
1. [User Timing API](https://www.w3.org/TR/user-timing/)
1. [Navigation Timing API](https://www.w3.org/TR/navigation-timing-2/)
1. Event Timing API
1. [Resource Timing API](https://www.w3.org/TR/resource-timing/)
1. [Frame Timing API](https://wicg.github.io/frame-timing/)
    > This work is NO LONGER BEING PURSUED. It's left here for historical purposes.
1. [Performance Timeline](https://www.w3.org/TR/performance-timeline/)
1. Long Task API
1. Server Timing
1. [Timing Entry Names Registry](https://w3c.github.io/timing-entrytypes-registry/)
