if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('exp-sw.js', {scope: '/example-pwa/'})
      .then((registration) => {
        console.log(
          'Successfully registered service worker with scope: ',
          registration.scope
        );
      })
      .catch((err) => {
        console.error('Failed to register service worker with err: ', err);
      });
  });
}
