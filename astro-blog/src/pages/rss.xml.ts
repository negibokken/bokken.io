import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getArticles } from '@/lib/strapi';

export async function GET(context: APIContext) {
  const articles = await getArticles();

  return rss({
    title: 'bokken.io',
    description: 'A blog about web development, browsers, and technology',
    site: context.site!,
    items: articles.map((article) => ({
      title: article.title,
      pubDate: new Date(article.publishedDate),
      description: article.summary || '',
      link: `/articles/${article.slug}/`,
    })),
    customData: '<language>ja</language>',
  });
}
