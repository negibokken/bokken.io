#!/usr/bin/env node

import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const astroDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const distDir = join(astroDir, "dist");
const blogSource = join(distDir, "blog.bokken.io");
const workerDist = join(distDir, "workers");
const publicWww = join(astroDir, "public-www");
const publicX = join(astroDir, "public-x");
const headersSource = join(astroDir, "worker-assets", "_headers");

if (!existsSync(blogSource)) {
  throw new Error(`Astro output does not exist: ${blogSource}`);
}

function copyDirectory(source, destination) {
  mkdirSync(destination, { recursive: true });
  cpSync(source, destination, { recursive: true, force: true });
}

function copySharedFiles(destination) {
  copyDirectory(publicWww, destination);
  copyFileSync(headersSource, join(destination, "_headers"));
}

rmSync(workerDist, { recursive: true, force: true });

const blogDestination = join(workerDist, "blog");
copyDirectory(blogSource, blogDestination);
copySharedFiles(blogDestination);

const wwwDestination = join(workerDist, "www");
copyDirectory(blogSource, wwwDestination);
copySharedFiles(wwwDestination);

const xDestination = join(workerDist, "x");
mkdirSync(xDestination, { recursive: true });

for (const path of [
  "404.html",
  "_astro",
  "assets",
  "favicon.ico",
  "favicon.svg",
  "fonts",
  "maru.jpg",
  "maru.svg",
  "robots.txt",
  "rss.xml",
  "sitemap-index.xml",
]) {
  const source = join(blogSource, path);
  if (!existsSync(source)) continue;
  const destination = join(xDestination, path);
  if (path.includes(".") && !path.startsWith(".")) {
    copyFileSync(source, destination);
  } else {
    copyDirectory(source, destination);
  }
}

copyDirectory(publicX, xDestination);

const labSource = join(blogSource, "lab");
for (const entry of readdirSync(labSource, { withFileTypes: true })) {
  const source = join(labSource, entry.name);
  const destination =
    entry.name === "index.html"
      ? join(xDestination, "index.html")
      : join(xDestination, entry.name);

  if (entry.isDirectory()) {
    copyDirectory(source, destination);
  } else {
    copyFileSync(source, destination);
  }
}

copySharedFiles(xDestination);

console.log(`Prepared Worker assets in ${workerDist}`);
