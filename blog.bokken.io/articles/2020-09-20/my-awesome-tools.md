# 生産性アップのための一工夫

@tags: [生産性, プログラミング]

@date: [2020-09-20, 2020-09-20]

## 概要

最近生産性アップのためにやっていてよかったなと思うことがあったので紹介したい。

要点は下記である。

- 何度も繰り返すコマンドはスクリプトに
- コミットしてしまわないように .gitignore に追加
- ファイル単位で追加するのではなくディレクトリ単位で .gitignore して PATH を追加

## 背景

プロジェクト内での開発において、特定のコマンド列による操作を繰り返すことがよくある。

例えば DB の初期データのインサート、テストコマンドの実行などである。コマンド列にすると下記のようなコマンドである。

```shell
yarn db-data-insert
yarn test some-test
```

テストは開発中何度も実行するので、これらのコマンドを何度も実行するとなると少し手間である。また、コマンドが長くなるとなおさらだ。

何度も実行するとなると、これらのコマンドをシェルスクリプトにまとめてしまうのがよい。例えば下記のようにだ。

```shell
#!/bin/bash
yarn db-data-insert
yarn test some-test
```

しかしこのままでは、git で管理されているプロジェクトの場合、このファイルをコミットしないように気をつけなければいけない。

## 簡潔な方法

一つの方法としては `.gitignore` に書く方法がある。しかし、これではプロジェクトの `.gitignore` に個人のスクリプト名が入ってしまう。

そこで `~/.gitconfig` に下記のように設定を追加し、

```gitconfig
[core]
  excludeSfile = ~/.gitignore.global
```

`~/.gitignore.global` に自分自身のスクリプトのファイル名を追加すると自分の特定の操作をコミットせずに保持できる。

```sh
my-script
```

ひとまず、これだけでも特定の連続したコマンド列の操作を、コミットせずに好き勝手に追加できる。

## 簡潔な方法の問題点

しかし、このままでは新たなコマンドを追加するごとに、 `~/.gitignore.global` を更新しなければいけない。

例えば下記のようにだ。

```sh
my-script1
my-script2
my-script3
# ...
```

これでは少し手間である。

## 簡潔な方法の改善

何度も `~/.gitignore.global` を更新しないために、`~/.gitignore.global` にディレクトリを追加してしまえばよい。

```sh
my-awesome-tools
```

こうしてやると、 `my-awesome-tools` ディレクトリやそれ以下のファイルは ignore される。

つまり、 `my-awesome-tools` に `my-script1`、`my-script2`、`my-script3`...、と追加してやればよい。

```sh
$ ls my-awesome-tools
my-scripts1 my-scripts2 my-scripts3
```

こうすると、 `./my-awesome-tools/my-script1` とするとスクリプトを実行することができる。

## 発展

ただし、このままでは、毎回 `./my-awesome-tools` と入力しなければいけない。これも少し手間である。

できれば、`my-script1` と書くだけで実行したい。

その場合、自身の `~/.zshrc` や `~/.bashrc` に下記の一行を追加して、`my-awesome-tools` に `PATH` を通してやればよい。

```sh
export PATH=./my-awesome-tools:$PATH
```

すると、自分のプロジェクトのルートで、`my-script1` と打ち込むとコマンドが実行できる。

ディレクトリ構成としては、下記のようになるイメージである。

```
% tree .
.
├── README.md
├── my-awesome-tools
│   ├── my-script1
│   ├── my-script2
│   └── my-script3
└── src
    └── main.js
    ...
```

一点注意として、プロジェクトのルートではない `src` ディレクトリなどでは `my-script?` は実行できない。

これは `PATH` が通っているのは `./my-awesome-tools` だけで、プロジェクトのルートにいるときのみ、`${プロジェクトのルート}/my-awesome-tools` で参照できるからである。

## まとめ

ここまで、コミットするほどではないが、何度も実行するコマンドをスクリプト化し、誤ってプロジェクトに追加することなく作成する方法を紹介した。

最初にも述べたが要点は下記である。

- 何度も繰り返すコマンドはスクリプトに
- コミットしてしまわないように .gitignore に追加
- ファイル単位で追加するのではなくディレクトリ単位で .gitignore して PATH を追加

また引き続き何か良い方法が見つかれば紹介していきたい。
