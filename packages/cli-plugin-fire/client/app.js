/* eslint-disable import/prefer-default-export */
/* global VUEPRESS_TEMP_PATH */
import Vue from 'vue';
import Router from 'vue-router';
import { routes } from '@internal/routes';
import appEnhancers from '@internal/app-enhancers';
import globalUIComponents from '@internal/global-ui';
import VuePress from './plugins/VuePress';
import { handleRedirectForCleanUrls } from './redirect.js';
import { getLayoutAsyncComponent } from './util';

// built-in components
import Content from './components/Content.js';

Vue.config.productionTip = false;

Vue.use(Router);
Vue.use(VuePress);

Vue.component('Content', Content);
// core components
Vue.component('Layout', getLayoutAsyncComponent('Layout'));
Vue.component('NotFound', getLayoutAsyncComponent('NotFound'));

// global helper for adding base path to absolute urls
Vue.prototype.$withBase = function (path) {
  const base = this.$site.base;
  if (path.charAt(0) === '/') {
    return base + path.slice(1);
  } else {
    return path;
  }
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function createApp(isServer) {
  const routerBase = '';

  const router = new Router({
    base: routerBase,
    mode: 'history',
    fallback: false,
    routes,
    scrollBehavior(to, from, savedPosition) {
      if (savedPosition) {
        return savedPosition;
      } else if (to.hash) {
        if (Vue.$vuepress.$get('disableScrollBehavior')) {
          return false;
        }
        return {
          selector: decodeURIComponent(to.hash)
        };
      } else {
        return { x: 0, y: 0 };
      }
    }
  });

  handleRedirectForCleanUrls(router);

  const options = {};

  try {
    await Promise.all(
      appEnhancers
        .filter((enhancer) => typeof enhancer === 'function')
        .map((enhancer) => enhancer({ Vue, options, router, isServer }))
    );
  } catch (e) {
    console.error(e);
  }

  const app = new Vue(
    Object.assign(options, {
      router,
      render(h) {
        return h('div', { attrs: { id: 'app' } }, [
          h('RouterView', { ref: 'layout' }),
          h(
            'div',
            { class: 'global-ui' },
            globalUIComponents.map((component) => h(component))
          )
        ]);
      }
    })
  );

  return { app, router };
}
