#!/usr/bin/env node
/**
 * Syncs article images from src/content/blog/{date}/img/
 * to public/articles/{date}/img/ so Astro can serve them as static assets.
 */
import { cpSync, existsSync, mkdirSync, readdirSync } from "fs";
import { join } from "path";

const contentDir = "src/content/blog";
const publicDir = "public/articles";

function syncImages() {
  const dateDirs = readdirSync(contentDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const date of dateDirs) {
    const imgSrc = join(contentDir, date, "img");
    if (!existsSync(imgSrc)) continue;

    const imgDest = join(publicDir, date, "img");
    mkdirSync(imgDest, { recursive: true });
    cpSync(imgSrc, imgDest, { recursive: true });
    console.log(`Synced: ${imgSrc} -> ${imgDest}`);
  }
}

syncImages();
