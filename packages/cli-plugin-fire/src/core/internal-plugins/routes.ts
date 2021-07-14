/* eslint-disable no-use-before-define */
//@ts-ignore
export default (options, ctx) => ({
  name: '@fire/internal-routes',

  // @internal/routes
  async clientDynamicModules() {
    const code = importCode(ctx.globalLayout) + routesCode(ctx.pages);
    return { name: 'routes.js', content: code, dirname: 'internal' };
  }
});

/**
 * Import utilities
 * @param {string} globalLayout path of global layout component
 * @returns {string}
 */
function importCode(globalLayout: any) {
  return `
import { injectComponentOption, ensureAsyncComponentsLoaded } from '@app/util'
import GlobalLayout from ${JSON.stringify(globalLayout)}
import NotFound from '@app/components/NotFound.vue'
import PageComponents from  '@internal/page-components'
`;
}

/**
 * Get Vue routes code.
 * @param {array} pages
 * @returns {string}
 */
function routesCode(pages: any[]) {
  function genRoute({ path: pagePath, key: componentName }: any) {
    const code = `
  {
    name: ${JSON.stringify(componentName)},
    path: ${JSON.stringify(pagePath)},
    component: PageComponents[${JSON.stringify(componentName)}],
  }`;

    return code;
  }

  const notFoundRoute = `,
  {
    path: '*',
    component: NotFound
  }`;

  return `export const routes = [${pages.map(genRoute).join(',')}${notFoundRoute}\n]`;
}
