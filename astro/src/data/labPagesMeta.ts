export type PageMeta = {
  title: string;
  description: string;
  lang?: string;
  noindex?: boolean;
  headExtra?: string;
};

export const labPagesMeta: Record<string, PageMeta> = {
  "example-chips": {
    title: "CHIPS Example | bokken.io",
    description:
      "Example site for CHIPS (Cookies Having Independent Partitioned State)",
  },
  "example-clear-site-data": {
    title: "Clear Site Data Example | bokken.io",
    description: "Example site for the Clear-Site-Data HTTP header",
  },
  "example-coep": {
    title: "COEP Example | bokken.io",
    description: "Example site for Cross-Origin-Embedder-Policy (COEP)",
  },
  "example-performance-entry": {
    title: "Performance Entry Example | bokken.io",
    description: "Example site showing supported Performance Entry types",
  },
  "example-performance-timeline": {
    title: "Performance Timeline Example | bokken.io",
    description: "Example of Performance Timeline API execution",
    headExtra:
      '<link rel="stylesheet" type="text/css" href="/assets/css/small.css" media="screen and (max-width:480px)" />',
  },
  "example-prerender2": {
    title: "Prerender2 Example | bokken.io",
    description: "Example site for Prerender2 (Speculation Rules API)",
  },
  "example-pwa": {
    title: "Example Progressive Web App | bokken.io",
    description:
      "A sample site demonstrating Progressive Web App (PWA) features",
    lang: "en",
    headExtra:
      '<link rel="manifest" href="./manifest.json" />' +
      "<script>if ('serviceWorker' in navigator) { window.addEventListener('load', () => { navigator.serviceWorker.register('exp-sw.js', {scope: '/example-pwa'}).then((r) => console.log('SW registered:', r.scope)).catch((e) => console.error('SW failed:', e)); }); }</script>",
  },
  "example-render-blocking-site": {
    title: "Render-Blocking Site Example | bokken.io",
    description: "Example of a website with render-blocking resources",
    headExtra:
      '<script src="scripts/jquery-3.6.0.js"></script>\n' +
      '<script src="scripts/bootstrap.js"></script>\n' +
      '<script src="scripts/bootstrap.bundle.js"></script>\n' +
      '<link href="styles/bootstrap.css" type="text/css" rel="stylesheet" media="screen,print" />',
  },
  "too-heavy-image-page": {
    title: "Too Heavy Image Page | bokken.io",
    description: "A page with many heavy images for Prerender2 testing",
    noindex: true,
  },
};
