import { Octokit } from "octokit";
import { config } from "../config.js";
import { createBranchFromMain, listDraftBranches } from "../github/branches.js";
import {
  commitFile,
  deleteFile,
  getFileContent,
  listDirectory,
} from "../github/files.js";
import { createAndMergePR } from "../github/pullRequests.js";
import {
  parseFrontmatter,
  serializeFrontmatter,
  Frontmatter,
} from "./frontmatter.js";

const BLOG_BASE = "astro/src/content/blog";

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

export const listPublishedArticles = async (
  octokit: Octokit,
): Promise<
  Array<{ title: string; path: string; date: string; slug: string }>
> => {
  const { repoOwner, repoName } = config;
  const dirs = await listDirectory(
    octokit,
    repoOwner,
    repoName,
    BLOG_BASE,
    "main",
  );
  const articles: Array<{
    title: string;
    path: string;
    date: string;
    slug: string;
  }> = [];

  for (const dir of dirs.filter((d) => d.type === "dir")) {
    const files = await listDirectory(
      octokit,
      repoOwner,
      repoName,
      dir.path,
      "main",
    );
    for (const file of files.filter((f) => f.name.endsWith(".md"))) {
      const content = await getFileContent(
        octokit,
        repoOwner,
        repoName,
        file.path,
        "main",
      );
      if (!content) continue;
      const { frontmatter } = parseFrontmatter(content.content);
      const slug = file.name.replace(/\.md$/, "");
      articles.push({
        title: frontmatter.title || slug,
        path: file.path,
        date: dir.name,
        slug,
      });
    }
  }
  return articles;
};

export const listDraftArticles = async (
  octokit: Octokit,
): Promise<Array<{ branchName: string; title: string }>> => {
  const { repoOwner, repoName } = config;
  const branches = await listDraftBranches(octokit, repoOwner, repoName);
  const drafts: Array<{ branchName: string; title: string }> = [];

  for (const branch of branches) {
    const dirs = await listDirectory(
      octokit,
      repoOwner,
      repoName,
      BLOG_BASE,
      branch.name,
    );
    let title = branch.name;
    for (const dir of dirs.filter((d) => d.type === "dir")) {
      const files = await listDirectory(
        octokit,
        repoOwner,
        repoName,
        dir.path,
        branch.name,
      );
      for (const file of files.filter((f) => f.name.endsWith(".md"))) {
        const content = await getFileContent(
          octokit,
          repoOwner,
          repoName,
          file.path,
          branch.name,
        );
        if (content) {
          const { frontmatter } = parseFrontmatter(content.content);
          title = frontmatter.title || title;
        }
      }
    }
    drafts.push({ branchName: branch.name, title });
  }
  return drafts;
};

export interface ArticleContent {
  frontmatter: Frontmatter;
  body: string;
  filePath: string | null;
  fileSha: string | null;
}

export const getArticleContent = async (
  octokit: Octokit,
  branchName: string,
): Promise<ArticleContent> => {
  const { repoOwner, repoName } = config;
  const dirs = await listDirectory(
    octokit,
    repoOwner,
    repoName,
    BLOG_BASE,
    branchName,
  );

  for (const dir of dirs.filter((d) => d.type === "dir")) {
    const files = await listDirectory(
      octokit,
      repoOwner,
      repoName,
      dir.path,
      branchName,
    );
    for (const file of files.filter((f) => f.name.endsWith(".md"))) {
      const content = await getFileContent(
        octokit,
        repoOwner,
        repoName,
        file.path,
        branchName,
      );
      if (content) {
        const { frontmatter, body } = parseFrontmatter(content.content);
        return {
          frontmatter,
          body,
          filePath: content.path,
          fileSha: content.sha,
        };
      }
    }
  }

  return {
    frontmatter: { title: "", description: "", pubDate: "", tags: [] },
    body: "",
    filePath: null,
    fileSha: null,
  };
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
