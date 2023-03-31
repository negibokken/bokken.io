# アプリケーションのパフォーマンスを計測するためのタイミング関係の API について

@tags: [Browser, Timing API, Performance]

@date: [2023-03-23, 2023-03-23]

## テンプレート用ファイル

1. [User Timing API](https://www.w3.org/TR/user-timing/)
1. [Navigation Timing API](https://www.w3.org/TR/navigation-timing-2/)
1. Event Timing API
1. [Resource Timing API](https://www.w3.org/TR/resource-timing/)
1. [Frame Timing API](https://wicg.github.io/frame-timing/)
    > This work is NO LONGER BEING PURSUED. It's left here for historical purposes.
1. [Performance Timeline](https://www.w3.org/TR/performance-timeline/)
1. Long Task API
1. Server Timing

2 によると、現状 Performance 関連のエントリには 11種類の type が存在している。 element(PerformanceElementTiming), event(PerformanceEventTiming), first-input(PerformanceEventTiming), largest-contentful-paint(LargestContentfulPaint), longtask(PerformanceLongTaskTiming), mark(PerformanceMark), measure(PerformanceMeasure), navigation(PerformanceNavigationTiming), paint(PerofmrnacePaintTiming), resource(PerformanceResourceTiming), taskattribution(PerformanceAttributionTiming)

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

## 対応状況

### W3C 上のどの状態か

### 主要3ブラウザの実装状況

## 参考資料・リンク

1. [Web Performance Working Group](https://www.w3.org/webperf/)
2. [PerformanceEntry.entryType - Web APIs | MDN](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceEntry/entryType)

まず、パフォーマンス系の API にどういった種類のものがあるのか？
それぞれの関係はなにか？
例えば、navigation 関係のものと、resource 周りのもの、Timing 周りのもの、など色々あるけど、これらはどういった関係で整理されているんだろうか。
何が漏れていなくて何が漏れているんだろう。現状何が足りていないんだろうか。
もしかして RUM とかで手動で頑張って mark をセットして計測しているところを？？
