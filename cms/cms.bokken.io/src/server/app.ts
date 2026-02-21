import express, { type Application } from "express";
import cookieSession from "cookie-session";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "./config.js";
import authRouter from "./auth/router.js";
import articlesRouter from "./articles/router.js";
import imagesRouter from "./images/router.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app: Application = express();

app.use(
  cookieSession({
    name: "session",
    secret: config.sessionSecret,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "lax",
  }),
);

app.use(express.json({ limit: "10mb" }));

app.use("/api/auth", authRouter);
app.use("/api/articles", articlesRouter);
app.use("/api/articles", imagesRouter);

const distDir = path.resolve(__dirname, "../../dist");
app.use(express.static(distDir));

app.get("*", (_req, res) => {
  res.sendFile(path.join(distDir, "index.html"));
});

export default app;
