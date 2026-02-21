import { Router, Request, Response } from "express";
import { requireAuth } from "../auth/middleware.js";
import { createOctokit } from "../github/client.js";
import { createBranchFromMain } from "../github/branches.js";
import { config } from "../config.js";
import {
  generateBranchName,
  listPublishedArticles,
  listDraftArticles,
  getArticleContent,
  saveArticle,
  publishArticle,
} from "./service.js";
import { Frontmatter } from "./frontmatter.js";

const router = Router();

router.use(requireAuth);

router.get("/", async (req: Request, res: Response) => {
  const octokit = createOctokit(req.session!.accessToken);
  const [published, drafts] = await Promise.all([
    listPublishedArticles(octokit),
    listDraftArticles(octokit),
  ]);
  res.json({ published, drafts });
});

router.post("/", async (req: Request, res: Response) => {
  const octokit = createOctokit(req.session!.accessToken);
  const branchName = generateBranchName();
  await createBranchFromMain(
    octokit,
    config.repoOwner,
    config.repoName,
    branchName,
  );
  res.json({ branchName });
});

router.get("/*", async (req: Request, res: Response) => {
  const branchName = decodeURIComponent(req.params[0]);
  const octokit = createOctokit(req.session!.accessToken);
  const article = await getArticleContent(octokit, branchName);
  res.json(article);
});

router.put("/*", async (req: Request, res: Response) => {
  const branchName = decodeURIComponent(req.params[0]);
  const { frontmatter, body, slug, existingFilePath, existingSha } =
    req.body as {
      frontmatter: Frontmatter;
      body: string;
      slug: string;
      existingFilePath: string | null;
      existingSha: string | null;
    };
  const octokit = createOctokit(req.session!.accessToken);
  const filePath = await saveArticle(
    octokit,
    branchName,
    frontmatter,
    body,
    slug,
    existingFilePath,
    existingSha,
  );
  res.json({ ok: true, filePath });
});

router.post("/*/publish", async (req: Request, res: Response) => {
  const fullParam = decodeURIComponent(req.params[0]);
  const branchName = fullParam.replace(/\/publish$/, "");
  const { frontmatter, body, slug, existingFilePath, existingSha, isNew } =
    req.body as {
      frontmatter: Frontmatter;
      body: string;
      slug: string;
      existingFilePath: string | null;
      existingSha: string | null;
      isNew: boolean;
    };
  const octokit = createOctokit(req.session!.accessToken);
  await publishArticle(
    octokit,
    branchName,
    frontmatter,
    body,
    slug,
    existingFilePath,
    existingSha,
    isNew,
  );
  res.json({ ok: true });
});

export default router;
