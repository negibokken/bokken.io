import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

const SITE = "https://www.bokken.io";
const DESCRIPTION =
  "WebやWebブラウザに関する技術について書いているブログ。Chromiumプロジェクトへのコントリビューションや、Web 標準に関する考察を中心に掲載。";

function buildHeader(): string {
  return `# www.bokken.io\n\n> ${DESCRIPTION}\n\n## Articles\n\n`;
}

function buildArticleLines(
  posts: Awaited<ReturnType<typeof getCollection<"blog">>>,
): string {
  return posts
    .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime())
    .map(({ id, data }) => {
      const url = `${SITE}/articles/${id}.md`;
      return `- [${data.title}](${url}): ${data.description}`;
    })
    .join("\n");
}

export const GET: APIRoute = async () => {
  const posts = await getCollection("blog");
  const body = buildHeader() + buildArticleLines(posts);
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
