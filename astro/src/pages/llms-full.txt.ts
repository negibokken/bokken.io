import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const SEPARATOR = '\n\n---\n\n';

function readMarkdown(id: string): string {
  const filePath = resolve(`src/content/blog/${id}.md`);
  return readFileSync(filePath, 'utf-8');
}

function buildFullContent(
  posts: Awaited<ReturnType<typeof getCollection<'blog'>>>
): string {
  return posts
    .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime())
    .map(({ id }) => readMarkdown(id))
    .join(SEPARATOR);
}

export const GET: APIRoute = async () => {
  const posts = await getCollection('blog');
  const body = buildFullContent(posts);
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
