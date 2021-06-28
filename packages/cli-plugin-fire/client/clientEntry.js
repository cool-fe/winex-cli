import { createApp } from './app';

createApp(false /* isServer */).then(({ app, router }) => {
  router.onReady(() => {
    app.$mount('#app');
  });
});
