import yaml from "js-yaml";

export interface Frontmatter {
  title: string;
  description: string;
  pubDate: string;
  updatedDate?: string;
  heroImage?: string;
  tags: string[];
  slug?: string;
}

export interface ParsedArticle {
  frontmatter: Frontmatter;
  body: string;
}

export const parseFrontmatter = (raw: string): ParsedArticle => {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { frontmatter: emptyFrontmatter(), body: raw };
  const frontmatter = yaml.load(match[1]) as Frontmatter;
  if (!Array.isArray(frontmatter.tags)) frontmatter.tags = [];
  return { frontmatter, body: match[2] };
};

export const serializeFrontmatter = (
  frontmatter: Frontmatter,
  body: string,
): string => {
  const data = { ...frontmatter };
  if (!Array.isArray(data.tags)) data.tags = [];
  const yamlStr = yaml.dump(data, { lineWidth: -1 });
  return `---\n${yamlStr}---\n${body}`;
};

const emptyFrontmatter = (): Frontmatter => ({
  title: "",
  description: "",
  pubDate: new Date().toISOString().split("T")[0],
  tags: [],
});
