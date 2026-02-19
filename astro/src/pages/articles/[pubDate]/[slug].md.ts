import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { readFileSync } from 'fs';
import { resolve } from 'path';

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection('blog');
  return posts.map((post) => {
    const [pubDate, slug] = post.id.split('/');
    return { params: { pubDate, slug } };
  });
};

export const GET: APIRoute = ({ params }) => {
  const { pubDate, slug } = params;
  const filePath = resolve(`src/content/blog/${pubDate}/${slug}.md`);
  const content = readFileSync(filePath, 'utf-8');
  return new Response(content, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
