# Chromiumのビルドオプションの備忘録

@tags: [chromium]

@date: [2024-02-29, 2024-02-29]

## はじめに

[以前の記事](https://blog.bokken.io/articles/2021-02-28/how-to-build-chromium.html)でChromiumのビルドをする際のコマンドを備忘録のためにまとめた。
基本的にはデフォルトの設定を使っているのだが、デバッガと併用して使う場合には別途設定ファイルを変更して利用する必要があるため、その内容についてまとめる。

## 設定ファイル

現状、デフォルトビルドの際には次のようなオプションを使用している。これでも最低限、動作確認やテストの実行などはできる。

```
is_debug = false↲
is_component_build = true↲
symbol_level = 0↲
dcheck_always_on = false↲
cc_wrapper= "ccache"↲
enable_nacl = false↲

google_api_key = "*****"
google_default_client_id = "*****"
google_default_client_secret = "****"
```

デフォルトの動作の確認以外にもデバッガを使いたいときがある。
そういったときに上記の設定だとブレイクポイントが飛び飛びで止まってしまい期待する動作をしてくれない。

その際はデバッグビルドの際には次の設定を使用している。

```diff
- is_debug = false↲
+ is_debug = true
is_component_build = true↲
- symbol_level = 0↲
+ symbol_level = 2
dcheck_always_on = true
cc_wrapper= "ccache"↲
enable_nacl = false↲
```

差分は`is_debug`と`symbol_level`の部分だ。
[Chromiumのドキュメント](https://chromium.googlesource.com/chromium/src/+/63.0.3239.12/docs/linux_build_instructions.md#include-fewer-debug-symbols)を見ると、`is_debug`を`true`にするとデバッグアサーションが有効化される。
`symbol_level=2`では、すべてのデバッグシンボルが含まれるようになる。
`symbol_level=0`の場合には、デバッグ用のシンボルが少ないのである程度ビルド時間が早くなるが、デバッガと併用する際には役に立たないビルドになってしまう。
最近は細かい動作確認をするため、`symbol_level=2`をデフォルトで使っている。
ビルド時間もインクリメンタルビルドをしてくれるので、一日一回ビルドをすればそこまで時間がかからないのもその理由だ。

### その他の高速化のtips

その他の高速化のtipsとして、[tmpfsを利用すると早くなる](https://chromium.googlesource.com/chromium/src.git/+/49.0.2621.2/docs/linux_faster_builds.md#using-tmpfs)ということでデフォルトビルドの際には利用している。

tmpfsは次のようなコマンドで作成できる(あらかじめ`out/Default`ディレクトリを作成している必要がある)。

```sh
sudo mount -t tmpfs -o size=100G,nr_inodes=160k,mode=1777 tmpfs out/Default
```

こうすることで、RAMにファイルシステムを作れるので読み書きが速くなる…らしい。
たしかに体感でもかなり早くなった気がする(また、余裕のあるときに実験結果を記載したい)。

なお、公式のドキュメントではsizeが20G、nr_inodesが40kになっているが、実行途中でディスクスペースが足りなくなってしまったので調整している。

また、デフォルトビルドだけで利用していると述べたが、デバッグビルドの設定だとビルド途中でこけるため利用していない。
なぜデバッグビルドのときにこけるのか突き止められたら、またこの記事に追記する予定だ。


## おわりに

今回はビルドのためのコマンドを備忘録のためにまとめた。

もしも、こういった設定以外に有用なChromiumのビルドの設定やビルドのコマンドがあったらぜひ [@bokken_](https://twitter.com/bokken_) に教えてください。
