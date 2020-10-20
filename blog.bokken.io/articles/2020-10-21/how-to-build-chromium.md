# Chromium をビルドする方法のまとめ

@tags: [browser, chromium]

@date: [2020-10-15, 2020-10-15]

## 概要

趣味でブラウザを作っている延長で、 Chromium をビルドしてテストを走らせて遊んでいる。

その際リンクが各所にあって手順が難しいなと感じたので、この記事にまとめて備忘録としておきたい。

また、あまりビルド時間について紹介されている記事が少ないので、この記事ではその点についても言及する。

## 前提環境

最初に筆者の環境は下記である。

- MacBook Pro: (13-inch, 2019, Four THunderbolt 3 ports)
- Processor: 2.8GHz Quad-Core Intel Core7
- Memory: 16GB 2133 MHz LPDDR3
- Graphics Intel Iris Plus Grapphics 6555 1536MB

諸々必要なツールは下記である。

参考となるページは下記だ。

https://www.chromium.org/developers/design-documents

## 必要なツールを準備する

dep_tool の話

## ビルドする

### Chromium のビルド

下記スクリプトでビルドしている

```sh
#!/bin/bash
gn gen out-gn --args='cc_wrapper="ccache"'

export CCACHE_CPP2=yes
export CCACHE_SLOPPINESS=time_macros
export PATH=`pwd`/third_party/llvm-build/Release+Asserts/bin:$PATH
ninja -C out/Default chrome
```

### Cromium の実行

```sh
#!/bin/bash
./out/Default/Chromium.app/Contents/MacOS/Chromium
```

### ユニットテストのビルド

```sh
#!/bin/bash
ninja -C out/Default chrome/test:unit_tests
```

### ユニットテストの実行

```sh
#!/bin/bash
# refer: https://chromium.googlesource.com/chromium/src/+/master/docs/mac_build_instructions.md#Running-test-targets

# out/Default/unit_tests --gtest_filter="PushClientTest.*" --disable-features="MediaRouter"
out/Default/unit_tests --disable-features="MediaRouter"
```

### Web テスト

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

### Web テストの実行

```sh
#!/bin/bash
./third_party/blink/tools/run_web_tests.py -t Default
```

## ビルド・テストの実行速度

### スペック

### 結果

#### Chromium のビルド時間

#### テストのビルド時間

#### テストの実行時間

## 参考文献
