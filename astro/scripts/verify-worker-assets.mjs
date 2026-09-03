#!/usr/bin/env node

import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const astroDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const workerDist = join(astroDir, "dist", "workers");

const expectedFiles = {
  blog: [
    "index.html",
    "articles/index.html",
    "humans.txt",
    ".well-known/security.txt",
    "_headers",
  ],
  www: [
    "index.html",
    "privacy-policy/index.html",
    "humans.txt",
    ".well-known/security.txt",
    "_headers",
  ],
  x: [
    "index.html",
    "example-pwa/index.html",
    "example-pwa/manifest.json",
    "example-coep/index.html",
    "example-coep/img/test.png",
    "example-render-blocking-site/scripts/jquery-3.6.0.js",
    "too-heavy-image-page/img/heavy.png",
    "assets/img/icon.png",
    "_astro",
    "humans.txt",
    ".well-known/security.txt",
    "_headers",
  ],
};

for (const [site, paths] of Object.entries(expectedFiles)) {
  for (const path of paths) {
    assert.ok(
      existsSync(join(workerDist, site, path)),
      `${site} Worker asset is missing: ${path}`,
    );
  }
}

for (const site of Object.keys(expectedFiles)) {
  assert.equal(
    existsSync(join(workerDist, site, "wrangler.toml")),
    false,
    `${site} Worker assets must not contain wrangler.toml`,
  );
}

console.log("Verified Worker asset layout");
