# Progressive Web App 化する最低限の設定

@tags: [Web, PWA,App Manifest, Service Worker]

@date: [2020-10-25, 2020-10-25]

## 概要

Progressive Web App (PWA) の勉強がてら `https://blog.bokken.io` を PWA 化した。

<blockquote class="twitter-tweet"><p lang="ja" dir="ltr">ブログの PWA 化できたのでインストールできるようになった <a href="https://t.co/O36JnpcPjc">pic.twitter.com/O36JnpcPjc</a></p>&mdash; bokken✏ (@bokken_) <a href="https://twitter.com/bokken_/status/1320280517451804673?ref_src=twsrc%5Etfw">October 25, 2020</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

本記事では、その内容をまとめておきたい。

記事ではインストールを可能にするのみで、コンテンツのキャッシュや push 通知などは行わない。

それは blog で対応した際に改めて記事にする。

## デモ

本 blog も PWA 化しているが、別途[デモ](https://x.bokken.io/example-pwa/index.html) を用意している。

## Progressive Web App (PWA)とは

まず簡単に Progressive Web App とは何かをおさらいしておく。

PWA とは aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa である。

技術的には下記が関係してくる。

- [Web App Manifest](https://www.w3.org/TR/appmanifest/)
- [Service Workers 1](https://www.w3.org/TR/service-workers/)

もう一つ App Shell という概念も紹介されることが多い。

App Shell は PWA を実現するときのアーキテクチャの一つであって、最低限必要な技術要素ではない。

Google の App Shell モデルの記事には下記のようにある。

> アプリケーション シェル（App Shell）アーキテクチャは、ネイティブ アプリのように瞬時に、そして確実にユーザーの画面に読み込める Progressive Web App を構築する方法の 1 つです。
>
> -- [App Shell モデル  |  Web  |  Google Developers](https://developers.google.com/web/fundamentals/architecture/app-shell)

なので、本記事では簡単に Web App Manifest と、Service Worker について紹介した上で、PWA 化するときの設定を紹介する。

### PWA に必要なファイル概要

ひとまずこれらから必要になるファイルは下記である。

1. icon ファイル
1. pp Manifest フイル(manifest.json)
1. Service Worker を登録するための js ファイル (html に書いても良い)
1. 上記 1, 2 を読み込む html ファイル
1. Service Worker のファイル

## Web App Manifest

Web App Manifest とは下記にあるように Web アプリケーションのメタデータ (名前、アイコン、リンクなど)を表すファイルである。

> centralized place to put metadata associated with a web application. This metadata includes, but is not limited to, the web application's name, links to icons, as well as the preferred URL to open when a user launches the web application.
>
> -- [Web App Manifest](https://w3c.github.io/manifest/)

例えば下記のようなデータである。

```json
{
  "short_name": "bokken-blog",
  "name": "blog.bokken.io",
  "description": "A web tech blog",
  "icons": [
    {
      "src": "/assets/img/icon.svg",
      "type": "image/svg+xml",
      "sizes": "144x144"
    }
  ],
  "start_url": "/?source=pwa",
  "background_color": "#6c6c6c",
  "display": "standalone",
  "scope": "/",
  "theme_color": "#00a3af"
}
```

このファイルは `manifest.webmanifest` ファイルでもよいし、`manifest.json` でもよい。あるいは他のファイル名などであれば `ContentType: application/manifest+json` で返せばブラウザが解釈できる。

そして、html ファイルから下記のように読み込むことでブラウザに Web ページのメタ情報を伝えることができる。

```html
<link rel="manifest" href="/manifest.json" />
```

## Service Workers

Service Worker とは aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa 。

例えば、ひとまずは下記のようにすると Service Worker のファイルを `scope: '/' ` で登録することができる。

```js
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', {scope: '/'})
      .then((registration) => {
        console.log(
          'Successfully registered service worker with scope: ',
          registration.scope
        );
      })
      .catch((err) => {
        console.error('Failed to register service worker with err: ', err);
      });
  });
}
```

`sw.js` としては例えば下記のように install 時の event listener や activate 時の event listener、fetch 時の event listenr を登録しておく。

```js
self.addEventListener('install', (event) => {
  console.info('installed');
});

self.addEventListener('activate', (event) => {
  console.info('service worker activated');
});

self.addEventListener('fetch', (event) => {
  console.info('fetch event occurred');
});
```

## scope について

scope については Chrome の開発者である [@nhiroki\_](https://twitter.com/nhiroki_) さんの [ServiceWorker のスコープとページコントロールについて - Qiita](https://qiita.com/nhiroki/items/eb16b802101153352bba) の記事がとてもわかり易い。

## 参考リンク

- [What are Progressive Web Apps?](https://web.dev/what-are-pwas/)
- [Making PWAs work offline with Service workers - Progressive web apps (PWAs) | MDN](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Offline_Service_workers)
- [Introduction to Service Worker  |  Web  |  Google Developers](https://developers.google.com/web/ilt/pwa/introduction-to-service-worker)
- [What makes a good Progressive Web App?](https://web.dev/pwa-checklist/)
- [Progressive web apps (PWAs) | MDN](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Service Workers 1](https://www.w3.org/TR/service-workers/)
- [Service Workers: an Introduction  |  Web Fundamentals](https://developers.google.com/web/fundamentals/primers/service-workers?hl=en)
- [ServiceWorker のスコープとページコントロールについて - Qiita](https://qiita.com/nhiroki/items/eb16b802101153352bba)
