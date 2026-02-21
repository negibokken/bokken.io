# 記事ページへの「最新記事5本」と「前後記事ナビ」追加

## 現状の構造

| ファイル | 役割 |
|---|---|
| `astro/src/pages/articles/[pubDate]/[slug].html.astro` | getStaticPaths で全記事生成、BlogPost へ props 渡し |
| `astro/src/layouts/BlogPost.astro` | 記事レイアウト。現 Props = `CollectionEntry<"blog">["data"]` |

- 記事 ID 形式: `YYYY-MM-DD/slug`
- URL 形式: `/articles/YYYY-MM-DD/slug.html`
- 既存の prev/next・関連記事機能なし

## 実装方針

### データフロー

```
[slug].html.astro (getStaticPaths)
  → 全記事を pubDate 昇順ソート
  → 各記事に prev（古い） / next（新しい）を計算
  → props として { ...post, prevPost, nextPost } を渡す

BlogPost.astro
  → props で prevPost? / nextPost? を受け取る
  → <PostNavigation> を記事本文直後に配置
  → <LatestPosts> をその後に配置
```

### URL 生成ロジック

```ts
function postUrl(post: CollectionEntry<"blog">): string {
  return `/articles/${post.id}.html`;
}
```

### コンポーネント設計

#### `PostNavigation.astro`

- Props: `prevPost?: { title: string; url: string }`, `nextPost?: { title: string; url: string }`
- 前後リンクを左右に並べて表示（片方なければスペースで埋める）

#### `LatestPosts.astro`

- Props なし（内部で `getCollection("blog")` を呼び自己完結）
- pubDate 降順で上位5件を取得してリスト表示

## タスクリスト

- [x] `design/article-navigation.md` を作成
- [x] `astro/src/components/PostNavigation.astro` を新規作成
- [x] `astro/src/components/LatestPosts.astro` を新規作成
- [x] `[slug].html.astro` の `getStaticPaths()` を修正（prev/next 計算・props 追加）
- [x] `BlogPost.astro` の Props 拡張、新コンポーネントを追加
