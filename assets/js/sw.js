const CACHE_NAME = 'bokken-io-2020-10-25';

const urlsToCache = [];

self.addEventListener('install', (event) => {
  console.info('installed');
});

self.addEventListener('activate', (event) => {
  console.info('service worker activated');
});
