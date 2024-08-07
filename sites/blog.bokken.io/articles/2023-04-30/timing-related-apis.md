# Web サイトのパフォーマンスを計測するためのタイミング関係の API について

@tags: [Browser, Timing API, Performance]

@date: [2023-04-30, 2023-04-30]

## はじめに

Web サイトのパフォーマンスはビジネスにもインパクトを与える事があると言われている([参考]((https://developers-jp.googleblog.com/2021/05/core-web-vitals.html)))。
また、Google は検索ランクについて Core Web Vitals を考慮するということを[発表](https://developers.google.com/search/blog/2020/11/timing-for-page-experience)している。このことから、パフォーマンスを改善することは非常に重要であるといえそうだ。

パフォーマンスを改善するためには、まず計測できるようになる必要がある。昨今では様々なユーザ環境のパフォーマンスを計測するツールが提供されている。
本記事ではこれらのツールが一体どういった方法でパフォーマンスを計測しているのか、特に Performance Timeline という仕様に絞って紹介する。

## Performance Timeline API はどういう考え方でパフォーマンスの情報を提供しているか

[Performance Timeline](https://w3c.github.io/performance-timeline/) という仕様がベースになっている。
こちらの仕様には、Performance Observer が定義されている。この Performance Observer に、計測したいメトリクスを定義することで、そのメトリクスを Observe して知らせてくれる。

この Performance Observer を使えば、例えば次のような形でパフォーマンスメトリクスを監視し、メトリクスの保存場所へ送ることになるだろう。

```javascript
const observer = new PerofmranceObserver((entryList) => {
    for(const entry of entryList.getEntries()) {
        console.log(entry);
    }
}).observe({ type: "layout-shift"});
```

PerformanceObserver は、それまでに起こったエントリも buffer もされているため、すでに過ぎたイベントも粗めてエントリとして取得できる。また entryTypes を指定することで複数のエントリも指定できる。

```javascript
// buffer されたエントリも取得する
const observer = new PerofmranceObserver((entryList) => {
    for(const entry of entryList.getEntries()) {
        console.log(entry);
    }
}).observe({ type: "layout-shift", buffered: true});

// entryTypes という形で複数のエントリタイプを指定する
const observer = new PerofmranceObserver((entryList) => {
    for(const entry of entryList.getEntries()) {
        console.log(entry);
    }
}).observe({ entryTypes: ["first-input", "layout-shift]})
```

## 現在策定されている指標

Performance Observer で監視できるものは Performance Entry と呼ばれており、 [Timing Entry Names Registry](https://w3c.github.io/timing-entrytypes-registry/) によると、現状 Performance Entry には次の 11 種類の type が存在している。 それぞれ 2023 年 4 月 25 日現在の主要 3 ブラウザ が API の対応状況は次の表のようになっている。


|entryType | Interface Type | Chrome | Firefox | Safari |
|:-:|:- | :-:|:-:|:-:|
| mark    | [PerformanceMark](https://www.w3.org/TR/user-timing-2/#dom-performancemark) | o | o | o |
| measure | [PerformanceMeasure](https://www.w3.org/TR/user-timing-2/#dom-performancemeasure) | o | o | o |
| navigation | [PerformanceNavigationTiming](https://www.w3.org/TR/navigation-timing-2/#dom-performancenavigationtiming) | o | o | o |
| resource | [PerformanceResourceTiming](https://www.w3.org/TR/resource-timing-2/#dom-performanceresourcetiming) | o | o | o |
| longtask | [PerformanceLongTaskTiming](https://www.w3.org/TR/longtasks-1/#performancelongtasktiming) | o | x | x |
| paint | [PerformancePaintTiming](https://www.w3.org/TR/paint-timing/#performancepainttiming) | o | o | o |
| element |[PerformanceElementTiming](https://wicg.github.io/element-timing/#performanceelementtiming) | o | x | x |
| event | [PerformanceEventTiming](https://www.w3.org/TR/event-timing/#performanceeventtiming) | o | o | x |
| first-input | [PerformanceEventTiming](https://www.w3.org/TR/event-timing/#performanceeventtiming) | o | o | x |
| layout-shift | [LayoutShift](https://wicg.github.io/layout-instability/#layoutshift) | o | x | x |
| largest-contentful-paint | [LargestContentfulPaint](https://www.w3.org/TR/largest-contentful-paint/#largestcontentfulpaint) | o | x | x |

これらのエントリを使えば Core Web Vitals も計測できるようになる。例えば、 Largest Contentful Paint は次の様な形で取得できる。

```javascript
const observer = new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    const lastEntry = entries[entries.length - 1];
    if (lastEntry) {
        const lcp = lastEntry.startTime - performance.getEntriesByType('navigation')[0].activationStart;
        console.log(lcp);
    }
}).observe({ type: "largest-contentful-paint", buffered: true});
```

厳密には、Prerender2 の際や、BFCache によって復元された場合には navigation のスタートタイミング (0) からではなく、window が activate されたタイミングや、BFCache が restore されたタイミング (0 ではなくなる) ため、少し工夫が必要になる。より厳密に計測したい場合は [web-vitals](https://github.com/GoogleChrome/web-vitals) を参考にすると良いだろう。

## デモ

Performance Entry を確認するために[デモサイト](https://x.bokken.io/example-performance-entry/index.html)を用意した。上記の Performance Entry をすべて確認できるようになっている (一部操作が必要)。

次のように少し操作することで Performance Entry が取得できているのが分かる。

<img width=450 src="./img/performance-entries.gif" />

### 新しく追加されているエントリの種別

ここまで [Timing Entry Names Registry](https://w3c.github.io/timing-entrytypes-registry/) で紹介されている Performance Entry を紹介したが、[Timing Entry Names Registry](https://w3c.github.io/timing-entrytypes-registry/) は 2021 年 2 月から更新がされていない。
現状、新しくエントリが増えていないのか、Chrome の DevTools の console で `PerformanceObserver.supportedEntryTypes` を実行したところ、あたらしく 3 つのエントリ (`back-forward-cache-restoration`、`soft-navigation`、`visibility-state`) が追加されていることを確認できた。


```
PerformanceObserver.supportedEntryTypes
> (14) ['back-forward-cache-restoration', 'element', 'event', 'first-input', 'largest-contentful-paint', 'layout-shift', 'longtask', 'mark', 'measure', 'navigation', 'paint', 'resource', 'soft-navigation', 'visibility-state']
```

これらは Chromium ベースのブラウザでのみ利用できるようだが、これらについても簡単に表にまとめておく。

|エントリ|説明| 関連 link |
|:-:|:-|:-|
| back-forward-cache-restoration | BFCache で restoration されたタイミング | * https://bugs.chromium.org/p/chromium/issues/detail?id=1273925 |
| soft-navigation | SPA などで別ページに移動することなく画面遷移した際のタイミング | * https://groups.google.com/a/chromium.org/g/blink-dev/c/IK-IZTBo59U/m/r8WaR2YOBQAJ <br /> |
| visibility-state | ウィンドウが見える状態と隠れた状態が切り替わったタイミング | * https://groups.google.com/a/chromium.org/g/blink-dev/c/LA8HTx6tCKY/m/6VkL0jxtAQAJ |

## その他

これまで紹介した API は比較的簡単に Performance 情報を取得できる。
その他にも Chromium ベースのブラウザの場合は `${browse識別子}://tracing/` にアクセスすることで、より詳細なパフォーマンスの情報を取得できる。こちらはよりブラウザの詳細な実行状況を取得できるため情報量は多い。ただ、これはパフォーマンスに問題意識を感じた開発者やユーザが自ら実行するもので、RUM サービス提供者が使えるようなものではない。これまで紹介してきた API は開発者やユーザはもちろん、 RUM サービス提供者も利用できるようになっている。

## おわりに

ここまでパフォーマンスの計測ができる各種 API についてまとめて、対応状況等と合わせて紹介した。
Performance Observer によって一箇所に Performance 系のエントリがまとめて入ってくる API は拡張しやすそうに感じた (実際に続々と追加されていそうだ)。

一方で、これらの Performance Entry の扱いには少しクセがあり、BFCache によって restore されたのか、Prerender2 による navigation かなどによって、各エントリの情報を加工して使う必要がある。そのためにはブラウザについて深い理解が必要だろう。RUM (Real User Monitoring) を提供しているサービスのすごさが少し理解できたように感じる。

今後も Web Vitals は増えていき、その分だけ Performance Entry は増えていくが、基本を理解していればそれほど戸惑わなくても済みそうだ。この記事がその一助になれば嬉しい。

もしも、誤りや補足の情報があれば [issue](https://github.com/negibokken/bokken.io/issues) や [@bokken_](https://twitter.com/bokken_) までいただけると嬉しい。

## 参考資料・リンク

1. [Web Performance Working Group](https://www.w3.org/webperf/)
1. [PerformanceEntry.entryType - Web APIs | MDN](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceEntry/entryType)
1. [User Timing API](https://www.w3.org/TR/user-timing/)
1. [Navigation Timing API](https://www.w3.org/TR/navigation-timing-2/)
1. [Event Timing API](https://w3c.github.io/event-timing/)
1. [Resource Timing API](https://www.w3.org/TR/resource-timing/)
1. [Frame Timing API](https://wicg.github.io/frame-timing/)
    > This work is NO LONGER BEING PURSUED. It's left here for historical purposes.
1. [Performance Timeline](https://www.w3.org/TR/performance-timeline/)
1. [Long Task API](https://w3c.github.io/longtasks/)
1. [Server Timing](https://w3c.github.io/server-timing/)
1. [Timing Entry Names Registry](https://w3c.github.io/timing-entrytypes-registry/)
1. [Performance observer - Efficient access to performance data - Chrome Developers](https://developer.chrome.com/blog/performance-observer/)
1. [Custom metrics](https://web.dev/custom-metrics/)
1. [Largest Contentful Paint (LCP)](https://web.dev/lcp/)
1. [Google Developers Japan: Core Web Vitals によるビジネス インパクト](https://developers-jp.googleblog.com/2021/05/core-web-vitals.html)
