# Chromium をビルド・テストする方法とその実行時間の備忘録

@tags: [browser, Chromium]

@date: [2021-02-28, 2021-02-28]

## 概要

趣味でブラウザを作っている延長で、 Chromium をビルドしてテストを走らせて遊んでいる。

その際、ビルド、実行に必要なリンクが各所にあって難しいなと感じたので、この記事にまとめて備忘録としておきたい。

また、あまりビルドやテスト実行時間について紹介されている記事が少ないので、この記事ではその点についても言及する。

## 目次

1. [概要](#概要)
2. [目次](#目次)
3. [環境準備](#環境準備)
   1. [環境](#環境)
   2. [必要なツール](#必要なツール)
4. [手順](#手順)
   1. [開発用のツールを準備をする](#開発用のツールを準備をする)
      1. [フェッチする](#フェッチする)
      2. [更新する](#更新する)
   2. [Chromium のビルドと実行](#chromium-のビルドと実行)
      1. [ビルド設定の生成](#ビルド設定の生成)
      2. [Chromium のビルド](#chromium-のビルド)
      3. [Chromium の実行](#chromium-の実行)
   3. [テストのビルドと実行](#テストのビルドと実行)
      1. [ユニットテストのビルド](#ユニットテストのビルド)
      2. [ユニットテストの実行](#ユニットテストの実行)
      3. [Web テスト](#web-テスト)
      4. [Web テストの実行](#web-テストの実行)
5. [ビルド・テストの実行速度](#ビルドテストの実行速度)
   1. [ビルド時間](#ビルド時間)
   2. [テスト実行時間](#テスト実行時間)
6. [おわりに](#おわりに)
7. [参考文献](#参考文献)

## 環境準備

### 環境

最初に筆者の計算機環境は下記である。

- MacBook Pro: (13-inch, 2019, Four Thunderbolt 3 ports)
- Processor: 2.8GHz Quad-Core Intel Core7
- Memory: 16GB 2133 MHz LPDDR3
- Graphics Intel Iris Plus Graphics 6555 1536MB

この MacBook Pro を使ってビルドやテストを実行する。

### 必要なツール

[この公式のページ](https://chromium.googlesource.com/chromium/src/+/master/docs/mac_build_instructions.md) によると Chromium のビルドに必要なツールは下記である。

- Xcode 11.2+

Xcode がインストールされているかは、下記のコマンドで .sdk ファイルが表示されるかを確認すればよい。

```sh
ls `xcode-select -p`/Platforms/MacOSX.platform/Developer/SDKs
```

加えてインストールしておくと良いのは下記の Homebrew と ccache だ。

- [Homebrew](https://brew.sh/)

  ```sh
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"
  ```

- [ccache](https://ccache.dev/)

  ```sh
  brew install --HEAD ccache
  ```

ccache を導入しておくと再コンパイル時の時間が短縮できるようになる。それは[この記事](https://chromium.googlesource.com/chromium/src/+/master/docs/ccache_mac.md)に書かれている。

## 手順

主に[こちら](https://chromium.googlesource.com/chromium/src/+/master/docs/mac_build_instructions.md)の公式サイトに書かれている内容を抜粋してより詳細に手順を説明する。

移行のディレクトリは下記のようになっていることを前提としてすすめる。(変更する場合は PATH の設定などを適宜読み替えていただきたい)

```sh
cd ~
mkdir chromium
cd chromium
```

### 開発用のツールを準備をする

Chromium 関連の開発をする際には [depot_tool](https://dev.chromium.org/developers/how-tos/depottools) というツール群を使うようだ。

この中にはリポジトリをフェッチするときに使う `fetch` や sync するときに使う `gclient` 、ビルドに必要な設定ファイル等を生成する `gn` コマンドが含まれている。

depot_tool は下記のコマンドで clone してくる。

```sh
git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git
```

パスを通す必要があるため、使っているシェルに応じて `~/.bashrc` や `~/.zshrc` に下記の一行を追記する。

```sh
export PATH="$PATH:$HOME/depot_tools"
```

追記をしたあとは下記コマンドで、PATH を通した設定ファイルを読み込み直す。

```sh
source ~/.zshrc  # zsh を使っているときの例
```

以上で depot_tool を使うための下準備は完了した。

#### フェッチする

depot_tool が準備できればようやく Chromium のソースを clone できる。

その際のコマンドは下記である。

```sh
fetch chromium
```

このコマンドにもかなりの時間がかかる。容量が大きいため、テザリング環境や貧弱なネット回線では決して実行しないようにしてほしい。

#### 更新する

リポジトリに更新があった際には下記のコマンドでリポジトリを最新の状態にできる。 fetch のタイミングで下記コマンドも実行されるので fetch して直後は必要がない。

```sh
gclient sync
```

### Chromium のビルドと実行

下準備が長かったがようやくビルドができる。

ビルドには、設定ファイルの生成、ビルドの実行といった手順が必要だ。

順番に説明をする。

#### ビルド設定の生成

まず、 fetch してきた Chromium のディレクトリに移動する。

```sh
cd src
```

次にビルドファイルの生成だが、これには `gn` というコマンドを使う。下記のようにコマンドを実行するとエディタが立ち上がる。

```sh
gn gen out/Default
```

そこに下記のような設定ファイルを書き込む。

```sh
is_debug = false
is_component_build = true
symbol_level = 0
dcheck_always_on = true
cc_wrapper= "ccache"
enable_nacl = false
```

するとビルドに必要なファイル群が `out/Default` 以下に生成される。

この設定ファイルを作るために参考としたのは[この記事](https://www.chromium.org/developers/gn-build-configuration)と[この記事](https://chromium.googlesource.com/chromium/src/+/master/docs/ccache_mac.md)にある公式の設定で、これらの設定でビルド時間や再ビルド時間が短くなるらしい。

ただし、上記の設定はひとまず早くビルドするための設定である。

`is_debug` を `false` にしているため、Debug に必要な情報が取れないなどの弊害がある。

なので、Debug をしたい場合は全面的に設定を見直す必要がある。

#### Chromium のビルド

上記を終えるとようやくビルドができる。その際、下記スクリプトを `bulid_chromium` という名前で保存する。 ([この公式の文書](https://chromium.googlesource.com/chromium/src/+/master/docs/ccache_mac.md#build)をもとに作製している)

```sh
#!/bin/bash
export CCACHE_CPP2=yes
export CCACHE_SLOPPINESS=time_macros
export PATH=`pwd`/third_party/llvm-build/Release+Asserts/bin:$PATH
ninja -C out/Default chrome
```

上記のファイルに実行権限をつける。

```sh
chmod +x build_chromium
```

そして実行する。

```sh
./build_chromium
```

これで Chromium がビルドされる。とても長い時間がかかるのと、リソースを持っていかれるため PC を使わない時間帯に実行するとよい。

ビルドにかかる時間についてはビルド時間にかかわる節で述べる。

#### Chromium の実行

ビルドが終わるとローカル環境で Chromium を実行できる。

.app ファイルも生成されているが、コマンド的には下記のように実行すると Chromium が立ち上がる。

```sh
#!/bin/bash
./out/Default/Chromium.app/Contents/MacOS/Chromium
```

ここまででひとまず、Chromium 自身のビルドは完了だ。

### テストのビルドと実行

さて Chromium 本体がビルドできてしまえば、あとは簡単にテストのビルドなども行える。

Chromium プロジェクトのテストにはユニットテストと Web テストがある。

順番に説明する。

#### ユニットテストのビルド

ユニットテストをビルドするためには下記のコマンドを実行する。

```sh
ninja -C out/Default chrome/test:unit_tests
```

#### ユニットテストの実行

ユニットテストのビルドが終わったら、ユニットテストは下記のように実行すれば良い。

```sh
out/Default/unit_tests --disable-features="MediaRouter"
```

[Checking out and building Chromium for Mac](https://chromium.googlesource.com/chromium/src/+/master/docs/mac_build_instructions.md#avoiding-the-incoming-network-connections-dialog)にあるように、 "incoming network connections" のダイアログがたくさん出てくるので、それを抑えるために `--disable-features="MediaRouter"` を指定している。

#### Web テスト

[Testing in Chromium - Web Tests (formerly known as Layout Tests or LayoutTests)](https://chromium.googlesource.com/chromium/src/+/master/docs/testing/web_tests.md)を参考に下記のコマンドでテストをビルドする。

```sh
#!/bin/bash
autoninja -C out/Default blink_tests
```

#### Web テストの実行

上記でテストがビルドできれば、下記コマンド列でテストが実行できる。

```sh
#!/bin/bash
strip out/Default/Content\ Shell.app/Contents/MacOS/Content\ Shell
./third_party/blink/tools/run_web_tests.py -t Default
```

(Content_Shell については `strip ./xcodebuild/{Debug,Release}/content_shell.app/Contents/MacOS/content_shell` と書いてあるが、現在ではパスが変わっているようである)

上記までの手順で一通りビルド、およびテストの実行ができるようになった。

## ビルド・テストの実行速度

さて、最後にビルドやテストにかかった時間を紹介する。

計測方法は今まで紹介してきたコマンド列について time コマンドで計測した出力を掲載する。

### ビルド時間

|                |       real |         user |         sys |
| :------------: | ---------: | -----------: | ----------: |
|    Chromium    | 357m9.637s | 2477m45.654s | 216m50.804s |
| ユニットテスト | 54m57.304s |   389m3.974s |  22m42.069s |
|   Web テスト   | 43m16.608s |  308m35.270s |   17m8.060s |

### テスト実行時間

|                |       real |        user |        sys |
| :------------: | ---------: | ----------: | ---------: |
| ユニットテスト | 54m57.304s |  389m3.974s | 22m42.069s |
|   Web テスト   | 43m16.608s | 308m35.270s |  17m8.060s |

## おわりに

上記の手順や実行時間の例が、どなたかの参考となれば幸いである。

もし間違いや訂正があれば、[issue](https://github.com/negibokken/bokken.io/issues) か Twitter アカウントの [@bokken\_](https://twitter.com/bokken_) までご報告いただけると嬉しい。

## 参考文献

1. [Chromium \- The Chromium Projects](http://dev.chromium.org/Home)
1. [Checking out and building Chromium for Mac](https://chromium.googlesource.com/chromium/src/+/master/docs/mac_build_instructions.md)
1. [GN build configuration - The Chromium Projects](https://www.chromium.org/developers/gn-build-configuration)
1. [GN Reference](https://gn.googlesource.com/gn/+/master/docs/reference.md)
1. [Using CCache on Mac](https://chromium.googlesource.com/chromium/src/+/master/docs/ccache_mac.md)
1. [Testing in Chromium - Running web tests using the content shell](https://chromium.googlesource.com/chromium/src/+/master/docs/testing/web_tests_in_content_shell.md)
1. [Testing in Chromium - Web Tests (formerly known as Layout Tests or LayoutTests)](https://chromium.googlesource.com/chromium/src/+/master/docs/testing/web_tests.md)
1. [大規模ソフトウェア(Chromium)を手探る 導入・ビルド編 \- あさりさんの作業ログ](https://akaria.hatenablog.com/entry/2017/11/01/194502)
1. [Chromium を build しよう（libcaca で動く AA なやつを） \- Qiita](https://qiita.com/toyoshim/items/b2f33e1ff961a3e178b3)
