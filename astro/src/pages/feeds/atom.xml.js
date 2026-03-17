import { getCollection } from "astro:content";
import { SITE_TITLE, SITE_DESCRIPTION } from "../../consts";

function sortByDate(a, b) {
  return b.data.pubDate.valueOf() - a.data.pubDate.valueOf();
}

function toIsoString(date) {
  return date instanceof Date
    ? date.toISOString()
    : new Date(date).toISOString();
}

function escapeXml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildEntries(posts, siteUrl) {
  return posts.map((post) => {
    const url = `${siteUrl}articles/${post.id}.html`;
    const updated = toIsoString(post.data.updatedDate ?? post.data.pubDate);
    return `
  <entry>
    <title>${escapeXml(post.data.title)}</title>
    <link href="${escapeXml(url)}"/>
    <id>${escapeXml(url)}</id>
    <updated>${updated}</updated>
    <summary>${escapeXml(post.data.description)}</summary>
  </entry>`.trim();
  });
}

function buildAtomFeed(siteUrl, posts) {
  const latestUpdated =
    posts.length > 0
      ? toIsoString(posts[0].data.pubDate)
      : new Date().toISOString();
  const entries = buildEntries(posts, siteUrl);
  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(SITE_TITLE)}</title>
  <subtitle>${escapeXml(SITE_DESCRIPTION)}</subtitle>
  <link href="${escapeXml(`${siteUrl}feeds/atom.xml`)}" rel="self"/>
  <link href="${escapeXml(siteUrl)}"/>
  <id>${escapeXml(siteUrl)}</id>
  <updated>${latestUpdated}</updated>
  ${entries.join("\n  ")}
</feed>`;
}

export async function GET(context) {
  const siteUrl = context.site?.toString() ?? "https://blog.bokken.io/";
  const posts = (await getCollection("blog")).sort(sortByDate);
  const body = buildAtomFeed(siteUrl, posts);
  return new Response(body, {
    headers: { "Content-Type": "application/atom+xml; charset=utf-8" },
  });
}
