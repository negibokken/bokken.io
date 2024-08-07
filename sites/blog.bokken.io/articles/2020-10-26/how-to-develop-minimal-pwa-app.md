# Progressive Web App 化する最低限の設定

@tags: [Web, PWA,App Manifest, Service Worker]

@date: [2020-10-26, 2020-10-26]

## 概要

Progressive Web App (PWA) の勉強がてら `https://blog.bokken.io` を PWA 化した。

<blockquote class="twitter-tweet"><p lang="ja" dir="ltr">ブログの PWA 化できたのでインストールできるようになった <a href="https://t.co/O36JnpcPjc">pic.twitter.com/O36JnpcPjc</a></p>&mdash; bokken✏ (@bokken_) <a href="https://twitter.com/bokken_/status/1320280517451804673?ref_src=twsrc%5Etfw">October 25, 2020</a></blockquote>

本記事では、その内容をまとめておきたい。

記事ではインストールを可能にするのみで、コンテンツのキャッシュや push 通知などは行わない。

それは blog で対応した際に改めて記事にする。

## 目次


<!-- vim-markdown-toc Marked -->

* [デモ](#デモ)
* [Progressive Web App (PWA)とは](#progressive-web-app-(pwa)とは)
    * [PWA に必要なファイル概要](#pwa-に必要なファイル概要)
* [Web App Manifest](#web-app-manifest)
* [Service Workers](#service-workers)
* [必要となるファイル](#必要となるファイル)
    * [scope について](#scope-について)
* [おわりに](#おわりに)
* [参考リンク](#参考リンク)

<!-- vim-markdown-toc -->

## デモ

本 blog も PWA 化しているが、別途[デモ](https://x.bokken.io/example-pwa/index.html) を用意している。

## Progressive Web App (PWA)とは

まず簡単に PWA とは何かをおさらいしておく。

PWA とはネイティブアプリケーションのようなユーザ体験を Web の技術で実現できる技術である。

クロスプラットフォームで提供されているブラウザ上でネイティブライクに動くアプリケーションが提供できれば、少ないコストでユーザ体験を向上させることが期待できる技術である。

要素技術的には下記が関係してくる。

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
1. Manifest フイル(manifest.json)
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
      "src": "/icon.svg",
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

このファイル名で指定する icon ファイル (icon.svg) は別途用意しておく必要がある。(ない場合は動かない)

この Web App Manifest ファイルの名前は `manifest.webmanifest` でもよいし、`manifest.json` でもよい。あるいは他のファイル名などであればサーバ側で `ContentType: application/manifest+json` で返せばブラウザが解釈できる。

そして、html ファイルから下記のように読み込むことでブラウザに Web ページのメタ情報を伝えることができる。

```html
<link rel="manifest" href="/manifest.json" />
```

## Service Workers

Service Worker というのは [Web Worker](https://www.w3.org/TR/workers/) の一種である。 Service Worker はブラウザの JavaScript からインストールされてバックグラウンドで動作する。

この Service Worker はプッシュ通知やプロキシ、バックグラウンドでの同期などで利用されているのを見かける技術である。

PWA 化するために Service Worker の JS ファイルとしては下記のような Event Listener を登録しておく。(下記はログを表示するだけである)

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

中でも fetch に対する `addEventListener` がないと「Page does not work offline」 と表示されてインストールができない。最低限 `fetch` に対する addEventListener を追加する必要がある。

このファイルを `sw.js` として保存しておき、下記のように html のページから `sw.js` を ブラウザに Service Worker として登録できる。

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

## 必要となるファイル

上記の説明を合わせると下記のようなファイル群が必要である。

1. icon ファイル
2. Web App Manifest ファイル

   ```json
   {
     "short_name": "blog.bokken.io",
     "name": "bokken.io",
     "description": "A web tech blog",
     "icons": [
       {
         "src": "icon.svg",
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

3. html ファイルと Service Worker を登録するための JavaScript

   ```html
   <!DOCTYPE html>
   <html lang="en">
     <head>
       <meta charset="UTF-8" />
       <title></title>
       <link rel="manifest" href="manifest.json" />
       <script>
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
                 console.error(
                   'Failed to register service worker with err: ',
                   err
                 );
               });
           });
         }
       </script>
     </head>
     <body>
       HELLO WORLD
     </body>
   </html>
   ```

4. Service Worker のファイル

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

これらのファイルを配信するだけで、PWA 化することができる。

### scope について

`manifest.json` や Service Worker 登録のタイミングで `scope` を指定するが、これは少しハマる可能性のあるポイントである。

要は PWA 化したアプリケーションがどこのページを提供するのかを表現する。この scope 内を Application 化するとイメージできる。ここで指定した範囲のリクエストなどは fetch イベント発生時にフックされて、オフラインのキャッシュを返したり、独自の処理を挟むことができる。

scope については Chrome の開発者である [@nhiroki\_](https://twitter.com/nhiroki_) さんの [ServiceWorker のスコープとページコントロールについて - Qiita](https://qiita.com/nhiroki/items/eb16b802101153352bba) の記事がとてもわかり易いので参照していただきたい。

## おわりに

Progressive Web App (PWA) 化に必要最低限の内容を紹介した。

これ以外にも `sw.js` を改良することで、インストール時やアクティベート時に処理を挟んだり、コンテンツのキャッシュをしておき fetch 時にプロキシ処理を挟むことでオフラインでアクセスできるようになったりする。

本ブログも機会があれが PWA 化し、そこで得た知見についてはまた記事にしたいと思う。

もしも不足している内容や間違っている内容があれば [issue](https://github.com/negibokken/bokken.io/issues) か Twitter アカウント [@bokken\_](https://twitter.com/bokken_) まで連絡をいただけると嬉しい。

## 参考リンク

- [What are Progressive Web Apps?](https://web.dev/what-are-pwas/)
- [Making PWAs work offline with Service workers - Progressive web apps (PWAs) | MDN](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Offline_Service_workers)
- [Introduction to Service Worker  |  Web  |  Google Developers](https://developers.google.com/web/ilt/pwa/introduction-to-service-worker)
- [What makes a good Progressive Web App?](https://web.dev/pwa-checklist/)
- [Progressive web apps (PWAs) | MDN](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Service Workers 1](https://www.w3.org/TR/service-workers/)
- [Service Workers: an Introduction  |  Web Fundamentals](https://developers.google.com/web/fundamentals/primers/service-workers?hl=en) [Service Worker の紹介  |  Web Fundamentals  |  Google Developers](https://developers.google.com/web/fundamentals/primers/service-workers?hl=ja)
- [ServiceWorker のスコープとページコントロールについて - Qiita](https://qiita.com/nhiroki/items/eb16b802101153352bba)
