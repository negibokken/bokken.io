import assert from "node:assert/strict";
import test from "node:test";

import { routeRequest } from "./site-router.mjs";

function createEnv(siteKind) {
  const requests = [];
  return {
    requests,
    env: {
      SITE_KIND: siteKind,
      ASSETS: {
        async fetch(request) {
          requests.push(request);
          return new Response(`asset:${new URL(request.url).pathname}`, {
            status: 200,
          });
        },
      },
    },
  };
}

test("redirects www article URLs to the blog hostname", async () => {
  const { env, requests } = createEnv("www");
  const response = await routeRequest(
    new Request("https://www.bokken.io/articles/example?source=www"),
    env,
  );

  assert.equal(response.status, 301);
  assert.equal(
    response.headers.get("location"),
    "https://blog.bokken.io/articles/example?source=www",
  );
  assert.equal(requests.length, 0);
});

test("serves the legacy privacy policy path without a redirect", async () => {
  const { env, requests } = createEnv("www");
  const response = await routeRequest(
    new Request("https://bokken.io/privacy-policy.html"),
    env,
  );

  assert.equal(response.status, 200);
  assert.equal(await response.text(), "asset:/privacy-policy");
  assert.equal(new URL(requests[0].url).pathname, "/privacy-policy");
});

test("returns Clear-Site-Data for supported experiment directives", async () => {
  const { env } = createEnv("x");
  const response = await routeRequest(
    new Request("https://x.bokken.io/clear-site-data/cache", {
      method: "POST",
    }),
    env,
  );

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("clear-site-data"), '"cache"');
});

test("rejects unknown Clear-Site-Data directives", async () => {
  const { env } = createEnv("x");
  const response = await routeRequest(
    new Request("https://x.bokken.io/clear-site-data/unknown"),
    env,
  );

  assert.equal(response.status, 404);
});

test("handles asset preflight requests with nginx-compatible CORS", async () => {
  const { env, requests } = createEnv("blog");
  const response = await routeRequest(
    new Request("https://blog.bokken.io/assets/img/icon.png", {
      method: "OPTIONS",
    }),
    env,
  );

  assert.equal(response.status, 204);
  assert.equal(response.headers.get("access-control-allow-origin"), "*");
  assert.equal(response.headers.get("access-control-max-age"), "1728000");
  assert.equal(requests.length, 0);
});

test("passes ordinary requests through to Static Assets", async () => {
  const { env, requests } = createEnv("blog");
  const response = await routeRequest(
    new Request("https://blog.bokken.io/articles"),
    env,
  );

  assert.equal(response.status, 200);
  assert.equal(requests.length, 1);
});
