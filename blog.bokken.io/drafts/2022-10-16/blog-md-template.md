# ブラウザのクライアントサイド storage についてまとめる

@tags: [browser, storage]

@date: [2022-10-13, 2022-10-13]

## はじめに

[前回の Anonymous iframe の記事](https://blog.bokken.io/articles/2022-09-27/about-anonymous-iframe.html)で、storage について触れた。

ブラウザが持つ storage にはどんなものがあるのか気になったので、
[MDN](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Client-side_web_APIs/Client-side_storage) や [Storage Standard](https://storage.spec.whatwg.org/) を読んでまとめてみる。

## メモ


クライアント Storage は、JavaScript API が提供されていて、クライアントサイド(ブラウザ)上にデータを保存する仕組みのことをいう。

[MDN](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Client-side_web_APIs/Client-side_storage)
にはクライアントサイド Storage は、例えば、サイトの個別の設定（色やフォントなど）、以前訪れたときのサイトの行動(ログイン状態、ショッピングカートなど)、Web サイトのアセット(HTML, JavaScript, CSS)、ドキュメントなどを保存するのに使えるとある。

MDN で具体的にクライアントサイド Storage と分類されているのは下記の 4 種類だ。

* Web Storage
    * local storage
    * session storage
* IndexedDB
* CacheAPI
* ServiceWorker
* (WebSQL もあるが多くのブラウザやユースケースで deprecated になっており、[W3C の Web Application Working Group もメンテナンスをしておらず](https://www.w3.org/TR/webdatabase/)、 Web Storage や Indexed DB の仕様を策定をしているようだ)

ブラウザが変わるとそのデータの同期はされないのが特徴だ。
（TODO: これってブラウザ Sync してたら共有されるんだろうか？）

クライアントサイド Storage とサーバサイド Storage はどちらか一方しか使えないようなものではなく、用途によって併用できる。

## Cookie

Cookie は古くから Storage として使われていた仕組みである。
昔は Cookie にユーザのデータを詰め込み、データを使い回すという方法が取られていた。昨今ではアプリケーションの内部データを詰め込む方法はあまり見られないが、session ID を保持するためには今でも使われている。

現在ではクライアントサイドでユーザのアプリケーションデータを保存するのには Web Storage や IndexedDB といった仕組みが使われている。

## Web Storage と IndexedDB

Web Storage と IndexedDB の違いは下記のようなところだ。

### Web Storage

Web Storage は下記の用に使う。

### localStorage と sessionStorage

sessionStorage maintains a separate storage area for each given origin that's available for the duration of the page session (as long as the browser is open, including page reloads and restores).
localStorage does the same thing, but persists even when the browser is closed and reopened.

[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API)によると、下記のようにいくつかのアクセス方法がある。


```
localStorage.colorSetting = '#a4509b';
localStorage['colorSetting'] = '#a4509b';
localStorage.setItem('colorSetting', '#a4509b');
```



### IndexedDB

IndexedDB は下記の用に使う。


## Cache API と Service Worker

### Cache API

### Service Worker

### Web Worker

### Shared Worker




## 参考

1. [Client-side storage - Learn web development | MDN](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Client-side_web_APIs/Client-side_storage)
2. [Storage Standard](https://storage.spec.whatwg.org/)
3. [Client-Side Storage Partitioning | storage-partitioning](https://privacycg.github.io/storage-partitioning/)
4. [Deprecations and removals in Chrome 94 - Chrome Developers](https://developer.chrome.com/blog/deps-rems-94/#deprecate-and-remove-websql-in-third-party-contexts)
5. [Using the Web Storage API - Web APIs | MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API)
