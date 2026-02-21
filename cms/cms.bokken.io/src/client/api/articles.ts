import type { Frontmatter } from "../../server/articles/frontmatter.js";

export interface PublishedArticle {
  title: string;
  path: string;
  date: string;
  slug: string;
}

export interface DraftArticle {
  branchName: string;
  title: string;
}

export interface ArticlesResponse {
  published: PublishedArticle[];
  drafts: DraftArticle[];
}

export interface ArticleContent {
  frontmatter: Frontmatter;
  body: string;
  filePath: string | null;
  fileSha: string | null;
}

export const fetchArticles = async (): Promise<ArticlesResponse> => {
  const res = await fetch("/api/articles");
  if (!res.ok) throw new Error("Failed to fetch articles");
  return res.json() as Promise<ArticlesResponse>;
};

export const createArticle = async (): Promise<{ branchName: string }> => {
  const res = await fetch("/api/articles", { method: "POST" });
  if (!res.ok) throw new Error("Failed to create article");
  return res.json() as Promise<{ branchName: string }>;
};

export const fetchArticle = async (
  branchName: string,
  filePath?: string,
): Promise<ArticleContent> => {
  const url = new URL(
    `/api/articles/${encodeURIComponent(branchName)}`,
    window.location.origin,
  );
  if (filePath) url.searchParams.set("filePath", filePath);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to fetch article");
  return res.json() as Promise<ArticleContent>;
};

export const saveArticle = async (
  branchName: string,
  payload: {
    frontmatter: Frontmatter;
    body: string;
    slug: string;
    existingFilePath: string | null;
    existingSha: string | null;
  },
): Promise<{ filePath: string }> => {
  const res = await fetch(`/api/articles/${encodeURIComponent(branchName)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to save article");
  return res.json() as Promise<{ filePath: string }>;
};

export const publishArticle = async (
  branchName: string,
  payload: {
    frontmatter: Frontmatter;
    body: string;
    slug: string;
    existingFilePath: string | null;
    existingSha: string | null;
    isNew: boolean;
  },
): Promise<void> => {
  const res = await fetch(
    `/api/articles/${encodeURIComponent(branchName)}/publish`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
  if (!res.ok) throw new Error("Failed to publish article");
};

export const uploadImage = async (
  branchName: string,
  date: string,
  file: File,
): Promise<string> => {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("date", date);
  const res = await fetch(
    `/api/articles/${encodeURIComponent(branchName)}/images`,
    { method: "POST", body: formData },
  );
  if (!res.ok) throw new Error("Failed to upload image");
  const data = (await res.json()) as { markdownPath: string };
  return data.markdownPath;
};
