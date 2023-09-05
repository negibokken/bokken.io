# 働いているけど Google Summer of Code (GSoC) に応募した

@tags: [Google Summer of Code, GSoC]

@date: [2022-04-30, 2022-05-20]

## 概要

今年から [Google Summer of Code (GSoC) の応募制限が緩和](https://opensource.googleblog.com/2021/11/expanding-google-summer-of-code-in-2022.html)されて、18 歳以上であれば、
誰でも応募できるようになった。

私はフルタイムでエンジニアとして働いているのだが、前述の通り募集条件が緩和され私も条件に当てはまるようになったので、
今年は応募してみたのであった。

まだ、結果は出ていないのだが周りを見てるとダメそうな気配を感じているので、
せめて応募に際してどんなことをしたのかをまとめて供養しておく。

## はじまり

はじまりは [Publickey の GSoC に関する記事](https://www.publickey1.jp/blog/22/google_summer_of_code18.html) を読んだことだった。
どうやら自分も募集要項に当てはまるようになったらしい。今まで GSoC にしてもセキュリティ・キャンプにしても気づいたときには対象者じゃなかったということがあったので、 これは応募してみたいなと思った。

ちょうど、 [Chromium へのコントリビューションをしている](https://blog.bokken.io/articles/2022-02-28/investigate-chromium-cors-header-parse-failure.html)こともあり、
応募するなら Chromium と決めていて、もう少し規模の大きなことをして貢献したいなと思った。

## プロジェクトを探す

応募することが決まったら Proposal を書かなければいけない。Proposal を書くにしても何かしらテーマがなければ書けない。
幸い Chromium に関するプロジェクトは[こちら](https://docs.google.com/document/d/1QnqhnsmEnHxoD1j7sWNFL5nybQ7rh5bMgPuf3NQLAtg/edit#heading=h.604ls06hmu0p)からテーマを探すことができたのでこの一覧から探すことにした。
(この他にも自分が興味のあるプロジェクトや取り組みたい bugs があれば別途取り組むことはできるようだ。)

私は標準化や Chromium の Shipping Process に興味があっため、そういった一連のプロセスを経験できるようなテーマを探した。
結果として、「 [4. Expose Render Blocking Status in Resource Timing](https://docs.google.com/document/d/1QnqhnsmEnHxoD1j7sWNFL5nybQ7rh5bMgPuf3NQLAtg/edit#bookmark=kix.tngp8wlygnyc)」では、私の希望が叶いそうだったのでこのプロジェクトに応募してみることにした。

## Proposal を書く

とにかく、最初はテーマの内容を掴むことに終始した。ゴールはなにか、何がゴールでないか、どうすれば実現できそうかをテーマの概要を読んで理解した。必要であれば、関連 issue や Web 記事を参照しながら周辺知識を蓄えていった。

結果として、この「 [4. Expose Render Blocking Status in Resource Timing](https://docs.google.com/document/d/1QnqhnsmEnHxoD1j7sWNFL5nybQ7rh5bMgPuf3NQLAtg/edit#bookmark=kix.tngp8wlygnyc)」では、

- Render Blocking Status を Resource Timing API に Expose すればよい
- 使うのは Realtime User Monitoring (RUM) を行うような Providers がメイン
- すでにある程度標準やコードが作られていて、完全にフルで一人で作っていく必要はない
- Shipping Process を経るので、スケジュールはそこそこ掛かりそう

というようなことが分かった。最終的に出来上がった Proposal は[こちら](https://docs.google.com/document/d/11J7GYUEAUlFnN3l9yWdMUEvd08hCLe4AeKZnbB4yyfk/edit?usp=sharing)に公開している。

仕事終わりに周辺について調べたり、コードを読み漁ったりしたので完成までに2週間ほどかかった。
結局、誰かにレビューしてもらうような時間もなく、そのまま提出したのであった。

## 振り返りと反省点

### 良かった点

今回の GSoC の提出を通して、久しぶりにちゃんとした文書を書くことができたのは、良い経験だった。
久しぶりにちゃんと文書構成を気にしたり一文一文を気にしながら文書を書いた気がする。荒く文章を書いて、それをブラッシュアップしていく作業の楽しさを久しぶりに体験できた。

合わせて、文書執筆に必要な VS Code の拡張機能をサクッと作れたのも良い点だった。
今回の Proposal ではChromium のコードを読みながら、どの部分のことを指しているのか示す必要があったので、
さくっと [Chromium Code Search](https://source.chromium.org/chromium)の対象のリンクを [VS Code でコピーできる拡張](https://marketplace.visualstudio.com/items?itemName=negibokken.chromium-code-search-permalink)を作った。
この拡張機能のおかげでサクッとコピーして Proposal に転記するという作業がサクッとできたのでよかった。

合わせて、今回の Proposal に関して必要そうな実験的な Web サイトをサクッと作ったのも良かった。
([example of render-blocking site](https://x.bokken.io/example-render-blocking-site/index.html),[example of performance timeline](https://x.bokken.io/example-performance-timeline/index.html))

## 悪かった点

提出するまで、誰にも見てもらうことがなかったのは良くない点だった。正直書くことにいっぱいいっぱいになってしまってたので、誰かにレビューしてもらう余裕がなかった。
一応締め切り2日前にメンター候補にメールを送ってみたのだが応答はなかった。

可能ならもう少し前から、このテーマに興味があってプロポーザルを書いているよというアピールをしておくべきだった。
運が良ければテーマについて話す機会をもらえて自分の理解を正すことができたかもしれない。

## まとめ

今回 GSoC の応募制限が緩和されたので応募してみた。Proposal を書く経験を通して、
ちゃんとした文書を書いたり、必要なユーティリティをサクッと書くなどして効率を重視できたのはとても良かった。
反省点としては、メンター候補とはもっと早くから取り組みたいと思っているという意思表示だけでもしておいたほうが良かったということ。
まだ結果は出ていないので、結果が出たら改めてこの記事を更新する予定だ。

最後に今回 Proposal を書くにあたってお世話になった記事を掲載しておく。（ありがとうございました）

## 今回お世話になった記事

- [GSoCに採択された話 - 旅する情報系大学院生](https://travelingresearcher.com/entry/2017/05/06/010453)
- [Google Summer of Code 2016 参加記 その1 応募編 - 博多電光](https://hakatashi.hatenadiary.com/entry/2016/05/28/200827)
- [Google Summer of Code 2018 参加記 (1) 応募編 - n-yoshikawa’s blog](https://n-yoshikawa.hatenablog.com/entry/2018/04/26/015549)
- [Google Summer of Code 2018 参加記 (2) プロジェクト終了編 - n-yoshikawa’s blog](https://n-yoshikawa.hatenablog.com/entry/2018/08/25/175142)
- [Google Summer of Code 2019 参加記 (1) - n-yoshikawa’s blog](https://n-yoshikawa.hatenablog.com/entry/2019/06/29/111527)

## 2022/05/21 追記

正式に不採用通知がメールにて届いた。

結構時間をかけて書いたので辛いには辛いが、個人でもコントリビューションできるので切り替えてコントリビューションしていこうと思う。
