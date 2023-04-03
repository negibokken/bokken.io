# Web サイトのパフォーマンスを計測するためのタイミング関係の API について

@tags: [Browser, Timing API, Performance]

@date: [2023-03-23, 2023-03-23]

## はじめに

Web サイトのパフォーマンス

ユーザ体験を向上させるのはもちろん。
Google は Core Web Vitals を検索エンジン上で考慮すると述べている。

このことから Web サイトのパフォーマンスを把握するのは非常に重要であるといえる。

##

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

 [Timing Entry Names Registry](https://w3c.github.io/timing-entrytypes-registry/) によると、現状 Performance 関連のエントリには下記の 11種類の type が存在している。

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

ただし、2021 年 2 月から更新がされていない。2023年4月現在では Chrome には 3 つエントリが追加されているようだ。
それは DevTools の console で `PerformanceObserver.supportedEntryTypes` を実行すると確認できる。

```
PerformanceObserver.supportedEntryTypes
> (14) ['back-forward-cache-restoration', 'element', 'event', 'first-input', 'largest-contentful-paint', 'layout-shift', 'longtask', 'mark', 'measure', 'navigation', 'paint', 'resource', 'soft-navigation', 'visibility-state']
```

## memo

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

## デモ

現在ブラウザがサポートしている entry の一覧とその情報を取得する簡単なデモ環境を用意した。

## 対応状況

### W3C 上のどの状態か

### 主要3ブラウザの実装状況

### Intent はどういう常態化

## その他

これまで紹介した API は比較的簡単に timing 情報を取得できる。
その他にも Chromium ベースのブラウザの場合は `${browse識別子}://tracing/` にアクセスすることで、より詳細なパフォーマンスの情報を取得できる。こちらはよりブラウザの詳細な実行状況を取得できるため情報量は多い。

## 参考資料・リンク

1. [Web Performance Working Group](https://www.w3.org/webperf/)
2. [PerformanceEntry.entryType - Web APIs | MDN](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceEntry/entryType)
