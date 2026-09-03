const CLEAR_SITE_DATA_DIRECTIVES = new Set([
  "cache",
  "cookies",
  "storage",
  "executionContexts",
  "*",
]);

const ASSET_CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

function redirectArticles(url) {
  const destination = new URL(url);
  destination.protocol = "https:";
  destination.hostname = "blog.bokken.io";
  destination.port = "";
  return Response.redirect(destination, 301);
}

async function fetchPrivacyPolicy(request, env) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response(null, {
      status: 405,
      headers: { Allow: "GET, HEAD" },
    });
  }

  const assetUrl = new URL(request.url);
  assetUrl.pathname = "/privacy-policy";
  return env.ASSETS.fetch(
    new Request(assetUrl, {
      method: request.method,
      headers: request.headers,
    }),
  );
}

function clearSiteDataResponse(url) {
  const encodedDirective = url.pathname.slice("/clear-site-data/".length);
  let directive;

  try {
    directive = decodeURIComponent(encodedDirective);
  } catch {
    return new Response(null, { status: 400 });
  }

  if (!CLEAR_SITE_DATA_DIRECTIVES.has(directive)) {
    return new Response(null, { status: 404 });
  }

  return new Response(null, {
    status: 200,
    headers: { "Clear-Site-Data": `"${directive}"` },
  });
}

function assetMethodResponse(request) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        ...ASSET_CORS_HEADERS,
        "Access-Control-Max-Age": "1728000",
        "Content-Type": "text/plain; charset=UTF-8",
      },
    });
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response(null, {
      status: 405,
      headers: {
        ...ASSET_CORS_HEADERS,
        Allow: "GET, HEAD, OPTIONS",
      },
    });
  }

  return null;
}

export async function routeRequest(request, env) {
  const url = new URL(request.url);

  if (
    env.SITE_KIND === "www" &&
    (url.pathname === "/articles" || url.pathname.startsWith("/articles/"))
  ) {
    return redirectArticles(url);
  }

  if (env.SITE_KIND === "www" && url.pathname === "/privacy-policy.html") {
    return fetchPrivacyPolicy(request, env);
  }

  if (env.SITE_KIND === "x" && url.pathname.startsWith("/clear-site-data/")) {
    return clearSiteDataResponse(url);
  }

  if (url.pathname.startsWith("/assets/")) {
    const methodResponse = assetMethodResponse(request);
    if (methodResponse) return methodResponse;
  }

  return env.ASSETS.fetch(request);
}

export default {
  fetch: routeRequest,
};
