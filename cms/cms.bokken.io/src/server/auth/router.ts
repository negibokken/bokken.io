import { Router } from "express";
import crypto from "crypto";
import { config } from "../config.js";
import { buildAuthUrl, exchangeCodeForToken, getGithubUser } from "./github.js";

const router: Router = Router();

router.get("/github", (_req, res) => {
  const state = crypto.randomBytes(16).toString("hex");
  _req.session!.oauthState = state;
  res.redirect(buildAuthUrl(state));
});

router.get("/github/callback", async (req, res) => {
  const { code, state } = req.query as { code?: string; state?: string };

  if (!code || !state || state !== req.session?.oauthState) {
    res.status(400).json({ error: "Invalid OAuth state" });
    return;
  }

  try {
    const accessToken = await exchangeCodeForToken(code);
    const user = await getGithubUser(accessToken);

    if (user.login !== config.allowedGithubUser) {
      res.status(403).json({ error: "Forbidden: unauthorized user" });
      return;
    }

    req.session!.accessToken = accessToken;
    req.session!.username = user.login;
    req.session!.avatarUrl = user.avatar_url;
    delete req.session!.oauthState;

    res.redirect("/");
  } catch (err) {
    console.error("OAuth callback error:", err);
    res.status(500).json({ error: "Authentication failed" });
  }
});

router.get("/me", (req, res) => {
  if (!req.session?.accessToken) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  res.json({
    username: req.session.username,
    avatarUrl: req.session.avatarUrl,
  });
});

router.post("/logout", (req, res) => {
  req.session = null;
  res.json({ ok: true });
});

export default router;
