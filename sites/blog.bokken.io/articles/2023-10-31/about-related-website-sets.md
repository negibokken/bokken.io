# サードパーティ Cookie の制限を緩和する Related Website Sets (First-Party Sets) という仕様について

@tags: [privacy, cookie]

@date: [2023-10-31, 2023-10-31]


## 概要

現在 Web ブラウザでは、プライバシーの観点から、サードパーティ Cookie をブロックする流れがある。

しかし、Web コンテンツプロバイダーは複数のドメインでコンテンツを提供していて Cookie を共有したいことがある。例えば、アプリケーションごとにドメインを分けるケースだったり、アセットのためにドメインを分けているが Cookie を メインのサイトと共有したいケースがあるだろう。そういった異なるドメイン間において、サードパーティ Cookie を許可できるのが Related Website Sets (First-Party Sets)という仕様だ。

もともとは、First-Party Sets という名前で仕様の策定、実装が進んでいたのだが、より目的に沿った名前にするため Related Website Sets という名前に変更された[[1](https://developer.chrome.com/blog/related-website-sets/)]。本サイトでは、以降  Related Website Sets を使うことにする。

## 目次


<!-- vim-markdown-toc Marked -->

* [はじめに](#はじめに)
* [ユースケース](#ユースケース)
* [Related Website Sets を指定する方法](#related-website-sets-を指定する方法)
* [Related Website Sets への心配](#related-website-sets-への心配)
    * [持続可能性についての懸念](#持続可能性についての懸念)
    * [現状の対応状況に関する心配](#現状の対応状況に関する心配)
* [まとめ](#まとめ)
* [参考文献・関連リンク](#参考文献・関連リンク)

<!-- vim-markdown-toc -->

## はじめに

Related Website Sets はその名前が表す通り、関連する Website を定義して、サードパーティCookie を付与できるようにするための仕様だ。

これは以前に紹介した CHIPS と同じく、 サードパーティ Cookie 廃止にあたって、サードパーティ Cookie を使う有用なユースケースをサポートするために考案された。

例えば、ある組織が保持しているドメインにおいて、サブドメインを切ってサービスを分けている際にログイン状態を保持し続けたいときに、SameSite 属性を指定した Cookie を使うのがよくある方法だろう。

same-site で利用する `SameSite=Strict` や `SameSite=Lax` を指定した Cookie は問題ないが、 `SameSite=None` を指定した Cookie はブロックの対象である。例えば、国ごとにドメインを分けてトップレベルドメイン自体が違うようなときには、SameSite 属性では対応できない。Related Website Sets はそいうった **トップレベルドメイン自体が違うケースでサードパーティ Cookie を利用している場合に使える仕様**だ。

## ユースケース

より具体的なユースケースは Explainer に記載があり、下記のようなユースケースでは サードパーティ Cookie が必要な場合がある。

- アプリケーション
    - 例としてあげられているのは、Microsoft の [office.com](https://office.com)、[live.com](https://live.com)、[microsoft.com](https://microsoft.com) はそれぞれ同一の組織が同じアプリケーションを提供しているサイトだ
- ブランドドメイン
    - ブランドごとにドメインを分ける場合だ。例えば、[uber.com](https://uber.com) と [ubereats.com](https://ubereats.com) が例として挙げられている。
- カントリーコードごとのドメイン
    - [google.co.in](https://google.co.in) , [google.co.uk](https://google.co.uk) が例として挙げられている。
- サンドボックス ドメイン
    - ユーザのアップロードしたコンテンツとそうでないコンテンツを分けてセキュリティ境界を作るために分けられたドメインがある。例えば [google.com](https://google.com), [googleusercontent.com](https://googleusercontent.com) 、github.com, [githubusercontent.com](http://githubusercontent.com) のような例がある。
- サービスドメイン
    - それ以外にも [github.com](https://github.com) と [githubassets.com](https://githubassets.com) 、 [facebook.com](https://facebook.com), [fbcdn.net](https://fbcdn.net) のように、異なるドメインでサービスを提供しているもの。

このような場合に、Related Website Sets を指定し、Storage Access API （Storage Access API は [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Storage_Access_API/Using#checking_and_requesting_storage_access) の例が参考になる）を利用することで サードパーティ Cookie にアクセスできる。

なお、RWS は広告に関連するユースケースは含まれておらず、広告に関連する機能をサポートは対象外のようだ。その他 [Non-goals](https://github.com/WICG/first-party-sets/tree/main#non-goals) にはサードパーティサインインや、コンバージョンの計測などもこの仕様の対象外になっている。

## Related Website Sets を指定する方法

Related Website Sets を指定する方は [GoogleChrome/related-website-sets](https://github.com/GoogleChrome/related-website-sets) で管理されており、投稿する方法は GitHub のリポジトリの[ガイドライン](https://github.com/GoogleChrome/related-website-sets/blob/main/RWS-Submission_Guidelines.md)に詳細がある。

Primary という概念があり、そこに Service と Associated という Subset の概念があり、その他 に ccTLD (Country Code Top-Level Domain) という 4 つの概念がある。

### Related Website Sets の概念

詳しくは[こちら](https://github.com/GoogleChrome/related-website-sets/blob/main/RWS-Submission_Guidelines.md#set-formation-requirements)にあるが、概要を紹介すると下記のとおりだ。

- Primary
    - メインのドメイン
- Service
    - ユーティリティやサンドボックスのためのドメインで、assets や cdn のような用途のドメインで、エントリポイントのようなドメインであってはならない。プライマリと同じオーナーが所有している必要がある
- Associated
    - 例えば、別サービスや別のサイトで同じロゴやフッタなどを有しているサイト
- ccTLD
    - 国や地理的位置が違うドメイン (.jp, .us など)
        - .jp と .us が Variants であるためには eSLD (effective Second-Level Domain) まで一致している必要がある
            - 例えば、[example.co.jp](https://example.co.jp) と [example.co.us](https://example.co.us) のようなもの
        - com や org のような組織は含まれていなさそうなので primary か service か associated になる

### Related Website Sets の定義

Related Website Sets は JSON で管理されている。ガイドラインから抜粋 (contact の項目を追加) すると、サイトオーナーは次のような JSON で Related Website Sets を定義する必要がある。

```json
{
  "primary": "https://primary.com",
  "contact": "example@example.comm",
  "associatedSites": ["https://associate1.com", "https://associate2.com", "https://associate3.com", "https://associate4.com"],
  "serviceSites": ["https://servicesite1.com"],
  "rationaleBySite": {
    "https://associate1.com": "An explanation of how you clearly present the affiliation across domains to users and why users would expect your domains to be affiliated",
    "https://associate2.com": "An explanation of how you clearly present the affiliation across domains to users and why users would expect your domains to be affiliated",
    "https://associate3.com": "An explanation of how you clearly present the affiliation across domains to users and why users would expect your domains to be affiliated",
    "https://serviceSite1.com": "An explanation of how each domain in this subset supports functionality or security needs."
  },

  "ccTLDs": {
    "https://associate1.com": ["https://associate1.ca", "https://associate1.co.uk", "https://associate1.de"],
    "https://associate2.com": ["https://associate2.ru", "https://associate2.co.kr", "https://associate2.fr"],
    "https://primary.com": ["https://primary.co.uk"]
  }
}
```

JSON を作る際には [RWS JSON Generator](https://rws-json-generator.ue.r.appspot.com/) を使って検証することが推奨されている。またこの要素を追加するためには Related Website Sets のリポジトリに Pull Request を送る必要がある。

なお、Related Website Sets で関連付けられるドメインは 5 個に限定されている。この制限は無尽蔵に Set を登録してトラッキングを乱用できないようにするためとのことだ。元々は 3 個の制限があったのだが、Web 標準参加団体から 3 個では少なすぎるという指摘があり、5 個に増えたという経緯がある。これから普及していくにつれて増える可能性もあるだろう。なお、この個数の制限の中にカントリーコードの違いによるドメインの違いはカウントされない。

Chrome は二週間ごとにこの  RWS のリストを[更新するようだ](https://github.com/GoogleChrome/related-website-sets/blob/main/RWS-Submission_Guidelines.md#browser-behavior)。設定を投稿しても反映されるまでには少し時間がかかる点にも注意したい。

## Related Website Sets への心配

### 持続可能性についての懸念

Related Website Sets は持続可能な方法なのかは心配ではある。Jxck さんのブログエントリの「[Public Suffix List の用途と今起こっている問題について | blog.jxck.io](https://blog.jxck.io/entries/2021-04-21/public-suffix-list.html)」 でも似たように GitHub の PR をボランティアのメンテナが捌いて疲弊しているという話があった。今回のリストは GoogleChrome organization のリポジトリなので Google のメンテナが捌くことになると思われるが、メンテナに一定の負担がかかり続けることになるだろう。Related Website Sets は Public Suffix List よりも用途が狭いとはいえ少し心配だ。

### 現状の対応状況に関する懸念

2024年第 1 四半期から 1 % に対して サードパーティ Cookie を無効にして第 3 四半期には 100% にする予定とのことだ。いよいよ開始されるのだが、[Related Website Sets](https://github.com/GoogleChrome/related-website-sets/blob/72e88145f02aaa38fe1f69d7ac1415dea956ba0e/related_website_sets.JSON) に含まれる要素は 8 件とそれほど多くない。少なくとも Microsoft や GitHub の例は含まれていそうなものなのだが、それも見当たらない。対応が完了しているサイトは多くないのかもしれない。

対応が必要かどうか確認する方法や、対応する方法については、Google から発表されている「[サード―パーティ Cookie の段階的廃止に備える](https://developer.chrome.com/ja/blog/cookie-countdown-2023oct/#%E3%82%B5%E3%83%BC%E3%83%89%E3%83%91%E3%83%BC%E3%83%86%E3%82%A3-cookie-%E3%81%AE%E6%AE%B5%E9%9A%8E%E7%9A%84%E5%BB%83%E6%AD%A2%E3%81%AB%E5%82%99%E3%81%88%E3%82%8B)」 に記載されている。また、開発者の場合は「[First-Party Sets: 開発者ガイド - Chrome for Developers](https://developer.chrome.com/ja/docs/privacy-sandbox/first-party-sets-integration/#requeststorageaccessfor-in-chrome)」も参考になるだろう。サイトオーナーや開発者の方は一度このガイドに沿って確認してみるのがよさそうだ。

## まとめ

今回、サードパーティ Cookie のブロックが始まる中で、有用なケースでサードパーティ Cookie を利用できるようにするための仕様である Related Website Sets (旧: First-Party Sets) を紹介した。

いよいよ 2024 年第 1 四半期から徐々に サードパーティ Cookie のブロックが始まるなかで、知らずに壊れてしまう Web サイトが出てこないか心配ではある。この記事が、Related Website Sets の必要有無を検討するきっかけになると幸いである。

もしも、誤りや補足の情報があれば [issue](https://github.com/negibokken/bokken.io/issues) や [@bokken_](https://twitter.com/bokken_) までいただけると嬉しい。

## 参考文献・関連リンク

- [Related Website Sets - Chrome for Developers](https://developer.chrome.com/docs/privacy-sandbox/related-website-sets/)
- [Related Website Sets - the new name for First-Party Sets in Chrome 117 - Chrome for Developers](https://developer.chrome.com/en/blog/related-website-sets/)
- [WICG/first-party-sets Explainer | GitHub](https://github.com/WICG/first-party-sets)
- Privacy models
    - Chromium: [privacy-model/README.md at main · michaelkleber/privacy-model · GitHub](https://github.com/michaelkleber/privacy-model/blob/main/README.md)
    - Edge: [Introducing tracking prevention, now available in Microsoft Edge preview builds - Microsoft Edge Blog](https://blogs.windows.com/msedgedev/2019/06/27/tracking-prevention-microsoft-edge-preview/)
    - Firefox: [Security/Anti tracking policy - MozillaWiki](https://wiki.mozilla.org/Security/Anti_tracking_policy)
    - WebKit: [Tracking Prevention Policy | WebKit](https://webkit.org/tracking-prevention-policy/)
- [Related Website Sets JSON Generator](https://rws-json-generator.ue.r.appspot.com/)
- [GitHub - GoogleChrome/related-website-sets](https://github.com/GoogleChrome/related-website-sets)
- [サードパーティ Cookie の廃止に向けた準備 - Chrome for Developers](https://developer.chrome.com/ja/blog/cookie-countdown-2023oct/)
- [サードパーティ Cookie の段階的廃止への準備 - Chrome for Developers](https://developer.chrome.com/ja/docs/privacy-sandbox/third-party-cookie-phase-out/#%E3%83%95%E3%82%A1%E3%83%BC%E3%82%B9%E3%83%88%E3%83%91%E3%83%BC%E3%83%86%E3%82%A3-cookie)
- [First-Party Sets: 開発者ガイド - Chrome for Developers](https://developer.chrome.com/ja/docs/privacy-sandbox/first-party-sets-integration/#requeststorageaccessfor-in-chrome)
