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

(WebSQL もあるが多くのブラウザやユースケースで deprecated になっており、[W3C の Web Application Working Group もメンテナンスをしておらず](https://www.w3.org/TR/webdatabase/)、 Web Storage や Indexed DB の仕様を策定をしているようだ)

ブラウザが変わるとそのデータの同期はされないのが特徴だ。
（TODO: これってブラウザ Sync してたら共有されるんだろうか？）

クライアントサイド Storage とサーバサイド Storage はどちらか一方しか使えないようなものではなく、用途によって併用できる。

## Cookie

Cookie は古くから Storage として使われていた仕組みである。
昔は Cookie にユーザのデータを詰め込み、データを使い回すという方法が取られていた。昨今ではアプリケーションの内部データを詰め込む方法はあまり見られないが、session ID を保持するためには今でも使われている。

現在ではクライアントサイドでユーザのアプリケーションデータを保存するのには Web Storage や IndexedDB といった仕組みが使われている。

## Storage の分類

4 種類あるストレージのうち用途が似ているもので分けると下記のようになる。

* Web Storage と IndexedDB
* Cache API と ServiceWorker

それぞれ、アプリケーションデータを保持するために使うのと、キャッシュとして使うというようにざっくりとした利用用途が分かれている。

## Web Storage と IndexedDB

Web Storage と IndexedDB の違いは

* 扱えるデータの種別
* API

にある。

### WebStorage

Web Storage は sessionStorage と localStorage に分かれる。
データはオリジンごとに分けて保持され、データの保存期間は、 sessionStorage はブラウザ(タブ)が閉じられるまで、 localStorage はブラウザが閉じられたとしても保持される。
セットできるデータとしては string のみである([Storage.setItem() - Web APIs | MDN](https://developer.mozilla.org/en-US/docs/Web/API/Storage/setItem))。

オブジェクトをセットしても下記のように `toString()` でシリアライズされて保持される。

```javascript
const value = {foo: 'bar'};
window.sessionStorage.setItem('test', value);
console.log(window.sessionStorage.getItem('test'));
// '[object Object]'
```

なので、 複雑なデータ構造を保持する場合は `JSON.stringify()` などで別途 string にシリアライズする必要がある。

上記の例では、setItem と getItem を使っているが、[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API)によると、下記のようにいくつかのアクセス方法がある。

```javascript
localStorage.colorSetting = '#a4509b';
localStorage['colorSetting'] = '#a4509b';
localStorage.setItem('colorSetting', '#a4509b');
```

### IndexedDB

IndexedDB は Web Storage と違って audio や video といった複雑なデータでも保存できる storage だ。

> You can store videos, images, and pretty much anything else in an IndexedDB instance.

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
6. [Storage for the web](https://web.dev/storage-for-the-web/)
