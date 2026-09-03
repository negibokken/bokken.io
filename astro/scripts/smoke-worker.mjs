#!/usr/bin/env node

import assert from "node:assert/strict";

const [siteKind, baseUrl] = process.argv.slice(2);

if (!siteKind || !baseUrl || !["blog", "www", "x"].includes(siteKind)) {
  console.error("Usage: node scripts/smoke-worker.mjs <blog|www|x> <base-url>");
  process.exit(2);
}

async function request(path, options = {}) {
  const response = await fetch(new URL(path, baseUrl), {
    redirect: "manual",
    ...options,
  });
  return response;
}

async function expectStatus(path, status, options) {
  const response = await request(path, options);
  assert.equal(response.status, status, `${path} returned ${response.status}`);
  await response.body?.cancel();
  return response;
}

async function expectHtml(path, marker) {
  const response = await request(path);
  assert.equal(response.status, 200, `${path} returned ${response.status}`);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html/,
    `${path} did not return HTML`,
  );
  assert.match(await response.text(), marker, `${path} is missing ${marker}`);
}

async function expectSharedAssets() {
  await expectStatus("/humans.txt", 200);
  await expectStatus("/.well-known/security.txt", 200);

  const assetResponse = await request("/assets/img/icon.png");
  assert.equal(assetResponse.status, 200);
  assert.equal(assetResponse.headers.get("access-control-allow-origin"), "*");
  await assetResponse.body?.cancel();

  const preflightResponse = await request("/assets/img/icon.png", {
    method: "OPTIONS",
  });
  assert.equal(preflightResponse.status, 204);
  assert.equal(
    preflightResponse.headers.get("access-control-allow-origin"),
    "*",
  );
  await preflightResponse.body?.cancel();
}

async function smokeBlog() {
  await expectHtml("/", /bokken\.io/);
  await expectHtml("/articles", /href="\/articles\//);
  await expectStatus("/rss.xml", 200);
  await expectStatus("/sitemap.xml", 200);
  await expectSharedAssets();
  await expectStatus("/__worker-smoke-not-found__", 404);
}

async function smokeWww() {
  await expectHtml("/", /bokken\.io/);
  await expectHtml("/privacy-policy.html", /プライバシーポリシー/);
  await expectSharedAssets();

  const redirectResponse = await request("/articles/example?source=smoke");
  assert.equal(redirectResponse.status, 301);
  assert.equal(
    redirectResponse.headers.get("location"),
    "https://blog.bokken.io/articles/example?source=smoke",
  );
  await redirectResponse.body?.cancel();
  await expectStatus("/__worker-smoke-not-found__", 404);
}

async function smokeX() {
  await expectHtml("/", /Web 技術に関する実験ページ/);

  for (const path of [
    "/example-chips",
    "/example-clear-site-data",
    "/example-coep",
    "/example-performance-entry",
    "/example-performance-timeline",
    "/example-prerender2",
    "/example-pwa",
    "/example-render-blocking-site",
    "/too-heavy-image-page",
  ]) {
    await expectHtml(path, /bokken\.io/);
  }

  await expectStatus("/example-pwa/manifest.json", 200);
  await expectStatus("/too-heavy-image-page/img/heavy.png", 200);
  await expectSharedAssets();

  const coepResponse = await request("/example-coep");
  assert.equal(coepResponse.status, 200);
  assert.equal(
    coepResponse.headers.get("cross-origin-embedder-policy"),
    "require-corp",
  );
  assert.equal(
    coepResponse.headers.get("cross-origin-resource-policy"),
    "same-origin",
  );
  await coepResponse.body?.cancel();

  const clearSiteDataResponse = await request("/clear-site-data/cache", {
    method: "POST",
  });
  assert.equal(clearSiteDataResponse.status, 200);
  assert.equal(clearSiteDataResponse.headers.get("clear-site-data"), '"cache"');
  await clearSiteDataResponse.body?.cancel();
  await expectStatus("/__worker-smoke-not-found__", 404);
}

const smokeTests = {
  blog: smokeBlog,
  www: smokeWww,
  x: smokeX,
};

await smokeTests[siteKind]();
console.log(`Smoke test passed for ${siteKind} at ${baseUrl}`);
