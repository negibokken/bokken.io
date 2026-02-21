import { Octokit } from "octokit";
import { config } from "../config.js";
import { createBranchFromMain, listDraftBranches } from "../github/branches.js";
import {
  commitFile,
  deleteFile,
  getFileContent,
  getRecursiveTree,
} from "../github/files.js";
import { createAndMergePR } from "../github/pullRequests.js";
import {
  parseFrontmatter,
  serializeFrontmatter,
  Frontmatter,
} from "./frontmatter.js";
import { getCache, setCache, deleteCache } from "../cache.js";

const BLOG_BASE = "astro/src/content/blog";
const PUBLISHED_CACHE_KEY = "published-articles";

const articleCacheKey = (branch: string, fp?: string): string =>
  `article:${branch}:${fp ?? ""}`;

export const generateBranchName = (): string => {
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  const date = `${jst.getUTCFullYear()}${pad(jst.getUTCMonth() + 1)}${pad(jst.getUTCDate())}`;
  const time = `${pad(jst.getUTCHours())}${pad(jst.getUTCMinutes())}${pad(jst.getUTCSeconds())}`;
  return `cms/draft/${date}-${time}`;
};

export const generateFilePath = (slug: string, date: string): string =>
  `${BLOG_BASE}/${date}/${slug}.md`;

const jstDateString = (): string => {
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${jst.getUTCFullYear()}-${pad(jst.getUTCMonth() + 1)}-${pad(jst.getUTCDate())}`;
};

const isBlogMdFile = (path: string): boolean =>
  path.startsWith(`${BLOG_BASE}/`) &&
  path.endsWith(".md") &&
  !path.includes("/img/") &&
  path.split("/").length === 6;

export const listPublishedArticles = async (
  octokit: Octokit,
  refresh = false,
): Promise<
  Array<{ title: string; path: string; date: string; slug: string }>
> => {
  if (!refresh) {
    const cached =
      getCache<
        Array<{ title: string; path: string; date: string; slug: string }>
      >(PUBLISHED_CACHE_KEY);
    if (cached) return cached;
  }

  const { repoOwner, repoName } = config;
  const tree = await getRecursiveTree(octokit, repoOwner, repoName, "main");
  const mdFiles = tree.filter((e) => e.type === "blob" && isBlogMdFile(e.path));

  const results = await Promise.all(
    mdFiles.map(async (entry) => {
      const parts = entry.path.split("/");
      const date = parts[parts.length - 2];
      const slug = parts[parts.length - 1].replace(/\.md$/, "");
      const content = await getFileContent(
        octokit,
        repoOwner,
        repoName,
        entry.path,
        "main",
      );
      if (!content) return null;
      const { frontmatter } = parseFrontmatter(content.content);
      return { title: frontmatter.title || slug, path: entry.path, date, slug };
    }),
  );

  const filtered = results
    .filter(
      (a): a is { title: string; path: string; date: string; slug: string } =>
        a !== null,
    )
    .sort((a, b) => b.date.localeCompare(a.date));

  setCache(PUBLISHED_CACHE_KEY, filtered);
  return filtered;
};

const getTitleFromBranch = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  branchName: string,
): Promise<string> => {
  try {
    const tree = await getRecursiveTree(octokit, owner, repo, branchName);
    const mdFile = tree.find((e) => e.type === "blob" && isBlogMdFile(e.path));
    if (!mdFile) return branchName;
    const content = await getFileContent(
      octokit,
      owner,
      repo,
      mdFile.path,
      branchName,
    );
    if (!content) return branchName;
    const { frontmatter } = parseFrontmatter(content.content);
    return frontmatter.title || branchName;
  } catch {
    return branchName;
  }
};

export const listDraftArticles = async (
  octokit: Octokit,
): Promise<Array<{ branchName: string; title: string }>> => {
  const { repoOwner, repoName } = config;
  const branches = await listDraftBranches(octokit, repoOwner, repoName);

  const drafts = await Promise.all(
    branches.map(async (branch) => ({
      branchName: branch.name,
      title: await getTitleFromBranch(
        octokit,
        repoOwner,
        repoName,
        branch.name,
      ),
    })),
  );

  return drafts.sort((a, b) => b.branchName.localeCompare(a.branchName));
};

export interface ArticleContent {
  frontmatter: Frontmatter;
  body: string;
  filePath: string | null;
  fileSha: string | null;
}

const emptyArticle = (): ArticleContent => ({
  frontmatter: { title: "", description: "", pubDate: "", tags: [] },
  body: "",
  filePath: null,
  fileSha: null,
});

export const getArticleContent = async (
  octokit: Octokit,
  branchName: string,
  filePath?: string,
  refresh = false,
): Promise<ArticleContent> => {
  const cacheKey = articleCacheKey(branchName, filePath);

  if (!refresh) {
    const cached = getCache<ArticleContent>(cacheKey);
    if (cached) return cached;
  }

  const { repoOwner, repoName } = config;
  const tree = await getRecursiveTree(octokit, repoOwner, repoName, branchName);
  const mdFile = filePath
    ? tree.find((e) => e.type === "blob" && e.path === filePath)
    : tree.find((e) => e.type === "blob" && isBlogMdFile(e.path));

  if (!mdFile) return emptyArticle();

  const content = await getFileContent(
    octokit,
    repoOwner,
    repoName,
    mdFile.path,
    branchName,
  );
  if (!content) return emptyArticle();

  const { frontmatter, body } = parseFrontmatter(content.content);
  const result: ArticleContent = {
    frontmatter,
    body,
    filePath: content.path,
    fileSha: content.sha,
  };

  setCache(cacheKey, result);
  return result;
};

export const saveArticle = async (
  octokit: Octokit,
  branchName: string,
  frontmatter: Frontmatter,
  body: string,
  slug: string,
  existingFilePath: string | null,
  existingSha: string | null,
): Promise<string> => {
  const { repoOwner, repoName } = config;
  const date = frontmatter.pubDate || jstDateString();
  const newPath = generateFilePath(slug, date);
  const raw = serializeFrontmatter(frontmatter, body);

  if (existingFilePath && existingFilePath !== newPath && existingSha) {
    await deleteFile(
      octokit,
      repoOwner,
      repoName,
      existingFilePath,
      existingSha,
      "CMS: remove old article file",
      branchName,
    );
    await commitFile(
      octokit,
      repoOwner,
      repoName,
      newPath,
      raw,
      `CMS: save article ${slug}`,
      branchName,
    );
  } else {
    const current = existingFilePath
      ? await getFileContent(
          octokit,
          repoOwner,
          repoName,
          existingFilePath,
          branchName,
        )
      : null;
    await commitFile(
      octokit,
      repoOwner,
      repoName,
      newPath,
      raw,
      `CMS: save article ${slug}`,
      branchName,
      current?.sha,
    );
  }

  deleteCache(articleCacheKey(branchName));
  return newPath;
};

export const publishArticle = async (
  octokit: Octokit,
  branchName: string,
  frontmatter: Frontmatter,
  body: string,
  slug: string,
  existingFilePath: string | null,
  existingSha: string | null,
  isNew: boolean,
): Promise<void> => {
  const { repoOwner, repoName } = config;
  const today = jstDateString();
  const updated = { ...frontmatter };

  if (isNew) {
    updated.pubDate = today;
  } else {
    updated.updatedDate = today;
  }

  const newPath = generateFilePath(slug, today);
  const raw = serializeFrontmatter(updated, body);

  if (existingFilePath && existingFilePath !== newPath && existingSha) {
    await deleteFile(
      octokit,
      repoOwner,
      repoName,
      existingFilePath,
      existingSha,
      "CMS: remove old article path before publish",
      branchName,
    );
    await commitFile(
      octokit,
      repoOwner,
      repoName,
      newPath,
      raw,
      `CMS: publish article ${slug}`,
      branchName,
    );
  } else {
    const current = existingFilePath
      ? await getFileContent(
          octokit,
          repoOwner,
          repoName,
          existingFilePath,
          branchName,
        )
      : null;
    await commitFile(
      octokit,
      repoOwner,
      repoName,
      newPath,
      raw,
      `CMS: publish article ${slug}`,
      branchName,
      current?.sha,
    );
  }

  await createAndMergePR(
    octokit,
    repoOwner,
    repoName,
    branchName,
    `Publish: ${updated.title || slug}`,
  );

  deleteCache(PUBLISHED_CACHE_KEY);
  deleteCache(articleCacheKey(branchName));
};

export const uploadImage = async (
  octokit: Octokit,
  branchName: string,
  date: string,
  filename: string,
  buffer: Buffer,
): Promise<string> => {
  const { repoOwner, repoName } = config;
  const imagePath = `${BLOG_BASE}/${date}/img/${filename}`;
  const content = buffer.toString("base64");

  await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
    owner: repoOwner,
    repo: repoName,
    path: imagePath,
    message: `CMS: upload image ${filename}`,
    content,
    branch: branchName,
  });

  return `./img/${filename}`;
};
