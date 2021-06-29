const PLUGIN_OPTION_META_MAP = {
  // hooks
  READY: { name: 'ready', types: [Function], async: true },
  COMPILED: { name: 'compiled', types: [Function] },
  UPDATED: { name: 'updated', types: [Function] },
  GENERATED: { name: 'generated', types: [Function], async: true },
  // options
  CHAIN_WEBPACK: { name: 'chainWebpack', types: [Function] },
  ENHANCE_APP_FILES: { name: 'enhanceAppFiles', types: [String, Object, Array, Function] },
  OUT_FILES: { name: 'outFiles', types: [Object] },
  CLIENT_DYNAMIC_MODULES: { name: 'clientDynamicModules', types: [Object, Function] },
  EXTEND_PAGE_DATA: { name: 'extendPageData', types: [Function] },
  ADDITIONAL_PAGES: { name: 'additionalPages', types: [Function, Array], async: true },
  GLOBAL_UI_COMPONENTS: { name: 'globalUIComponents', types: [String, Array] },
  DEFINE: { name: 'define', types: [Function, Object] },
  ALIAS: { name: 'alias', types: [Function, Object] },
  EXTEND_CLI: { name: 'extendCli', types: [Function] },
  BEFORE_DEV_SERVER: { name: 'beforeDevServer', types: [Function] },
  AFTER_DEV_SERVER: { name: 'afterDevServer', types: [Function] }
};

export const PLUGIN_OPTION_MAP: { [key: string]: any } = {};
Object.keys(PLUGIN_OPTION_META_MAP).forEach((key) => {
  PLUGIN_OPTION_MAP[key] = { key, ...PLUGIN_OPTION_META_MAP[key] };
});

export const OPTION_NAMES = Object.keys(PLUGIN_OPTION_META_MAP).map(
  (key) => PLUGIN_OPTION_META_MAP[key].name
);
