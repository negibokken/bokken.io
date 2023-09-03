# ブラウザの Storage Partitioning について

@tags: [browser, storage, privacy]

@date: [2023-07-31, 2023-07-31]

## はじめに

ブラウザは様々なストレージや内部状態を持っている。例えば、Cookieなどがわかりやすい例だろう。 この内部状態を元にoriginと通信をするが、セキュリティやプライバシーの観点から、この内部状態は許可されていない異なる origin へ漏れないようにしなければいけない。

では、実際にどういったストレージや内部状態を持っていて、それをどのように漏洩しないようにしているのか。
この記事では、W3C の [Privacy Community Group](https://privacycg.github.io/) で検討されている [Client-Side Storage Partitioning](https://privacycg.github.io/storage-partitioning/) で検討されている内容について紹介して、それを概観する。


## 脅威の例

各種ストレージや内部状態がどういった形で漏れる危険があるのか。ここで、ユーザを X、トップレベルサイトを site A 、cross-origin のサイトを site B, C として、対策がなされていない場合にどういっことが起きるかを簡単に事例を紹介してみる。


1. site A が iframe 等で site B を読み込み、site B が通常と比べて高速に描画されている場合 HTTP Cache が利用された可能性がある。つまり、ユーザは site B にアクセスしたことがあると site A が分かる。
2. ユーザ X が site B の計測要スクリプトを利用している site C にアクセスした後に、同様の site B の計測用スクリプトを利用している site A にアクセスしたときに X が B と C にアクセスしたこと紐付けられる
3. 同一プロセスのメモリ上に cross-origin のリソースを展開することで Spectre などのサイドチャネル攻撃の対象になりうる

ブラウザは様々な方法で ー CORSやCOEP、COOP、ORB など ー、さまざまな方法で同一プロセス上にcross-originのリソースの読み込みを制御できるようにしてきた。

また、2 番目の事例を防ぐ目的では、3rd Party Cookie をデフォルトでブロックするという動きがある。ただし、3rd Party Cookie が全て悪ではなく有用な事例 (例えば、サポートチャット、ロードバランサによる Cookie の利用) もある。そういった有用な事例のために、以前紹介した [CHIPS](https://blog.bokken.io/articles/2022-12-30/about-chips.html) という仕様では、デフォルトでブロックされる 3rd Party Cookie を `Partitioned` 属性をつけて、トップレベルの site (schemaとドメイン) と Cookie 送付先の site (schemaとドメイン) の double key で保存するようにすることで、ブロックを緩和できるのであった。

このように Web は様々なリソースを読み込んでコンテンツを作るという点で、すべてを単純に分割すればいいわけではない点に難しさがある。利便性と安全性と後方互換性など、さまざまなことを検討して仕様を策定していく必要がある。


## ブラウザの storage や状態

では、上記のような脅威を防ぐ対象として、ブラウザにはどのような storage や状態があるのか。[storage-partitionin の user-agent-state](https://privacycg.github.io/storage-partitioning/#user-agent-state)から抜粋すると下記のような storage や状態がある。

* Cookies
* Network state:
    * HTTP cache
    * HTTP connections
    * WebSocket connections
    * WebRTC connections
    * WebTransport connections
    * DNS
    * HTTP authentication
    * Alt-Svc
    * Fonts
    * HSTS
    * TLS client certificates
    * TLS session identifiers
    * HPKP
    * OCSP
    * Intermediate CA cache
    * Prefetch
    * Preconnect
    * CORS-preflight cache
* Storage:
    * Indexed DB
    * Cache API
    * localStorage
    * sessionStorage
    * BroadcastChannel
    * Shared workers
    * Service workers
    * Web Locks
* Web Authentication
* WebRTC’s deviceId
* Blob URL store
* HTML Standard’s list of available images
* window.name
* Browsing context group’s agent cluster map
* Permissions
    * Persistent storage
    * Notifications
* WebGL and WebGPU’s cache of compiled shaders and pipelines
* Non-standardized features:
* Credentials (username and password storage)
* Form autofill data storage
* Per-site user preferences
* Favicon cache
* Page info media previews
* Save Page As

ブラウザにはたくさんの storage や状態がある。 これらすべてについてブラウザは対応を考える必要がある。
ここではすべてについて触れることはしないが、今後の記事でまた触れていければと考えている。

## おわりに

今回は、W3C の [Privacy Community Group](https://privacycg.github.io/) で検討されている [Client-Side Storage Partitioning](https://privacycg.github.io/storage-partitioning/) を概観した。ブラウザは、非常に複雑な仕事(実装面でも仕様策定の面でも)を担っていることが少しでも伝われば嬉しい。

今後もまたこういったブラウザについて知ることができる内容をまとめていきたい。

もしも、誤りや補足の情報があれば [issue](https://github.com/negibokken/bokken.io/issues) や [@bokken_](https://twitter.com/bokken_) までいただけると嬉しい。

## 参考リンク

* [Privacy Community Group](https://privacycg.github.io/)
* [Client-Side Storage Partitioning | storage-partitioning](https://privacycg.github.io/storage-partitioning/#user-agent-state)
