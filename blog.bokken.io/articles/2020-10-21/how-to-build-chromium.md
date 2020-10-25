# Chromium をビルドする方法のまとめ

@tags: [browser, chromium]

@date: [2020-10-21, 2020-10-21]

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
   3. [用語集](#用語集)
4. [手順](#手順)
   1. [必要なツールで準備をする](#必要なツールで準備をする)
      1. [フェッチする](#フェッチする)
      2. [更新する](#更新する)
   2. [ビルド/テストを実行する](#ビルドテストを実行する)
      1. [Chromium のビルド](#Chromium-のビルド)
      2. [Cromium の実行](#Cromium-の実行)
      3. [ユニットテストのビルド](#ユニットテストのビルド)
      4. [ビルドターゲット](#ビルドターゲット)
      5. [ユニットテストの実行](#ユニットテストの実行)
      6. [Web テスト](#Web-テスト)
      7. [Content Shell](#Content-Shell)
      8. [Web テストの実行](#Web-テストの実行)
5. [ビルド・テストの実行速度](#ビルドテストの実行速度)
   1. [Chromium のビルド時間](#Chromium-のビルド時間)
   2. [ユニットテストのビルド時間](#ユニットテストのビルド時間)
   3. [Web テストのビルド時間](#Web-テストのビルド時間)
   4. [テストの実行時間](#テストの実行時間)
6. [参考文献](#参考文献)

## 環境準備

### 環境

最初に筆者の計算機環境は下記である。

- MacBook Pro: (13-inch, 2019, Four Thunderbolt 3 ports)
- Processor: 2.8GHz Quad-Core Intel Core7
- Memory: 16GB 2133 MHz LPDDR3
- Graphics Intel Iris Plus Grapphics 6555 1536MB

この MacBook Pro を使ってビルドやテストを実行する。

### 必要なツール

Chromium のビルドに必要なツールは下記である。

- aaa
- aaa
- aaa

参考となるのは[この公式のページ](https://www.chromium.org/developers/design-documents) である。

### 用語集

ここにドキュメントにあるツール群や、名前について記載する。なおこの節は、取り急ぎビルドしたいだけであれば飛ばして読んで、必要となったときに戻ってきても構わない。

- depot_tool
  - あああ
- gclient
- ninja
- gn
- goma
- ユニットテスト
- web test
- content shell

## 手順

主に[こちら](https://chromium.googlesource.com/chromium/src/+/master/docs/mac_build_instructions.md)の公式サイトに書かれている内容を抜粋してより詳細に手順を説明する。

### 必要なツールで準備をする

Chromium をビルドするときには dep_tool という物を使う。

#### フェッチする

```sh
fetch chromium
```

#### 更新する

```sh
gclient sync
```

### ビルド/テストを実行する

#### Chromium のビルド

args.gn を作っておく

```sh
# Set build arguments here. See `gn help buildargs`.
is_debug = false
is_component_build = true
symbol_level = 0
dcheck_always_on = true

enable_nacl = false
```

下記スクリプトでビルドしている

```sh
#!/bin/bash
gn gen out/Default --args='cc_wrapper="ccache"'

export CCACHE_CPP2=yes
export CCACHE_SLOPPINESS=time_macros
export PATH=`pwd`/third_party/llvm-build/Release+Asserts/bin:$PATH
ninja -C out/Default chrome
```

#### Cromium の実行

```sh
#!/bin/bash
./out/Default/Chromium.app/Contents/MacOS/Chromium
```

#### ユニットテストのビルド

```sh
#!/bin/bash
ninja -C out/Default chrome/test:unit_tests
```

#### ビルドターゲット

```sh
gn ls out/Default
```

#### ユニットテストの実行

```sh
#!/bin/bash
# refer: https://chromium.googlesource.com/chromium/src/+/master/docs/mac_build_instructions.md#Running-test-targets

# out/Default/unit_tests --gtest_filter="PushClientTest.*" --disable-features="MediaRouter"
out/Default/unit_tests --disable-features="MediaRouter"
```

#### Web テスト

[Testing in Chromium - Web Tests (formerly known as Layout Tests or LayoutTests)](https://chromium.googlesource.com/chromium/src/+/master/docs/testing/web_tests.md)を参考に。

```sh
#!/bin/bash
autoninja -C out/Default blink_tests
```

#### Content Shell

```sh
#!/bin/bash

out/Default/Content\ Shell.app/Contents/MacOS/Content\ Shell
```

#### Web テストの実行

```sh
#!/bin/bash
./third_party/blink/tools/run_web_tests.py -t Default
```

## ビルド・テストの実行速度

計測方法は上記のスクリプトを time コマンドで出力したものを掲載することとする。

### Chromium のビルド時間

```sh
real    357m9.637s
user    2477m45.654s
sys     216m50.804s
```

### ユニットテストのビルド時間

```sh
real    54m57.304s
user    389m3.974s
sys     22m42.069s
```

### Web テストのビルド時間

```sh
real    43m16.608s
user    308m35.270s
sys     17m8.060s
```

### テストの実行時間

## 参考文献

1. [Chromium \- The Chromium Projects](http://dev.chromium.org/Home)
1. [Checking out and building Chromium for Mac](https://chromium.googlesource.com/chromium/src/+/master/docs/mac_build_instructions.md)
1. [GN build configuration - The Chromium Projects](https://www.chromium.org/developers/gn-build-configuration)
1. [GN Reference](https://gn.googlesource.com/gn/+/master/docs/reference.md)
1. [Testing in Chromium - Running web tests using the content shell](https://chromium.googlesource.com/chromium/src/+/master/docs/testing/web_tests_in_content_shell.md)
1. [Testing in Chromium - Web Tests (formerly known as Layout Tests or LayoutTests)](https://chromium.googlesource.com/chromium/src/+/master/docs/testing/web_tests.md)
1. [大規模ソフトウェア(Chromium)を手探る 導入・ビルド編 \- あさりさんの作業ログ](https://akaria.hatenablog.com/entry/2017/11/01/194502)
1. [Chromium を build しよう（libcaca で動く AA なやつを） \- Qiita](https://qiita.com/toyoshim/items/b2f33e1ff961a3e178b3)
