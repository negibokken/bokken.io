import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { SITE_TITLE, SITE_DESCRIPTION } from "../consts";

function sortByDate(a, b) {
  return b.data.pubDate.valueOf() - a.data.pubDate.valueOf();
}

function toRssItem(post) {
  return {
    title: post.data.title,
    description: post.data.description,
    pubDate: post.data.pubDate,
    link: `/articles/${post.id}.html`,
  };
}

export async function GET(context) {
  const posts = (await getCollection("blog")).sort(sortByDate);
  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site,
    items: posts.map(toRssItem),
  });
}
