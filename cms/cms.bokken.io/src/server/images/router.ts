import { Router, Request, Response } from "express";
import multer from "multer";
import { requireAuth } from "../auth/middleware.js";
import { createOctokit } from "../github/client.js";
import { uploadImage } from "../articles/service.js";

const router: Router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/*/images",
  requireAuth,
  upload.single("image"),
  async (req: Request, res: Response) => {
    const fullParam = decodeURIComponent(req.params[0]);
    const branchName = fullParam.replace(/\/images$/, "");

    if (!req.file) {
      res.status(400).json({ error: "No image file provided" });
      return;
    }

    const { date } = req.body as { date: string };
    const octokit = createOctokit(req.session!.accessToken);
    const markdownPath = await uploadImage(
      octokit,
      branchName,
      date,
      req.file.originalname,
      req.file.buffer,
    );

    res.json({ markdownPath });
  },
);

export default router;
