#!/usr/bin/env python3

import re

# Import the file that is specified by argv[1]
import sys

if len(sys.argv) < 2:
    print("Usage: python pickup.py <filename>")
    sys.exit(1)


def remove_markdown(content):
    # マークダウン記法のリンクを除去
    content = re.sub(r"\[([^\]]+)\]\([^\)]+\)", r"\1", content)
    # マークダウン記法の画像を除去
    content = re.sub(r"!\[([^\]]+)\]\([^\)]+\)", r"\1", content)
    # マークダウン記法のコードブロックを除去
    content = re.sub(r"```[^\n]*\n([^`]+)```", r"\1", content, flags=re.MULTILINE)
    # マークダウン記法のインラインコードを除去
    content = re.sub(r"`([^`]+)`", r"\1", content)
    # マークダウン記法の見出しを除去
    content = re.sub(r"#+\s*(.*)", r"\1", content)
    # マークダウン記法の引用を除去
    content = re.sub(r">(.*)", r"\1", content)
    # マークダウン記法のリストを除去
    content = re.sub(r"^\s*[-*+]\s*(.*)", r"\1", content, flags=re.MULTILINE)
    # マークダウン記法の水平線を除去
    content = re.sub(r"\s*[-*]{3,}\s*", r"", content)
    # マークダウン記法とは違う@tags:や@date:を除去
    content = re.sub(r"@tags:.*", r"", content)
    content = re.sub(r"@date:.*", r"", content)
    # 複数の改行文字を1つにまとめる
    content = re.sub(r"\n+", r"\n", content)
    content = re.sub(r"\n", r"。", content)
    # 空白文字を削除
    # content = re.sub(r"\s*", r"", content)
    # 2つ以上の。を1つにまとめる
    content = re.sub(r"。+", r"。", content)
    # "をエスケープする
    content = re.sub(r'"', r"\"", content)
    return content


filename = sys.argv[1]
content = ""
with open(filename) as f:
    content = f.read()

# タイトルの抽出：最初に現れる「# 」で始まる行の後ろのテキスト
title_match = re.search(r"^#\s+(.*)", content, re.MULTILINE)
title = title_match.group(1).strip() if title_match else ""
title = '"' + title.replace('"', '"') + '"'

# description: マークダウン記法を簡単に除去したテキストの先頭200文字
plain_text = remove_markdown(content)
description = '"' + plain_text.strip()[:199] + "..." + '"'

# 日付情報の抽出: @date: [pubDate, updatedDate]
pubDate = ""
updatedDate = ""
date_match = re.search(r"@date:\s*\[([^\]]+)\]", content)
if date_match:
    date_str = date_match.group(1)
    # 例: "2020-01-01, 2020-01-02" としてカンマで分割
    dates = [d.strip() for d in date_str.split(",")]
    if len(dates) >= 2:
        pubDate = dates[0]
        updatedDate = dates[1]
    elif len(dates) == 1:
        pubDate = dates[0]

# タグ情報の抽出: @tags: ['tag1', 'tag2', ...]
tags = []
tags_match = re.search(r"@tags:\s*\[([^\]]+)\]", content)
if tags_match:
    tags_str = tags_match.group(1)
    # 各タグの両端の引用符と余分な空白を除去
    tags = [tag.strip().strip("'\"") for tag in tags_str.split(",")]

# Replace content @tags and @date tags to empty
# Remove h1 element of markdown
content = re.sub(r"^#\s+.*\n", r"", content)
content = re.sub(r"@tags:.*\n\n", r"", content)
content = re.sub(r"@date:.*\n\n", r"", content)

front_matter = {
    "title": title,
    "description": description,
    "pubDate": pubDate,
    "updatedDate": updatedDate,
    "tags": tags,
}

# Put front_matter in the top of the content
front_matter_str = (
    "---\n"
    + "\n".join([f"{key}: {value}" for key, value in front_matter.items()])
    + "\n---\n\n"
)
content = front_matter_str + content
print(content)
