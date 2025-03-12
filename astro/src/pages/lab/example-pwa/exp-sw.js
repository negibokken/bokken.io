self.addEventListener('install', (event) => {
  console.info('installed');
});

self.addEventListener('activate', (event) => {
  console.info('service worker activated');
});

self.addEventListener('fetch', (event) => {
  console.info('fetch event occurred');
});
