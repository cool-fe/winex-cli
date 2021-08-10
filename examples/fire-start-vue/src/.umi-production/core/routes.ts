// @ts-nocheck
import { ApplyPluginsType } from '/Users/gaowujun/work/vue相关源码仓库/umi-vue2/packages/runtime';
import * as umiExports from './umiExports';
import { plugin } from './plugin';

export function getRoutes() {
  const routes = [];

  // allow user to extend routes
  plugin.applyPlugins({
    key: 'patchRoutes',
    type: ApplyPluginsType.event,
    args: { routes },
  });

  return routes;
}
