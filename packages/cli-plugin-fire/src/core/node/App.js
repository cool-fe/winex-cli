/**
 * Module dependencies.
 */

const {
  fs,
  path,
  logger,
  chalk,
  globby,
  sort,
  datatypes: { isFunction },
  fallback: { fsExistsFallback }
} = require('@vuepress/shared-utils');

const loadConfig = require('./loadConfig');
const loadTheme = require('./loadTheme');

const Page = require('./Page');
const ClientComputedMixin = require('./ClientComputedMixin');
const PluginAPI = require('./plugin-api');
const DevProcess = require('./dev');
const BuildProcess = require('./build');
const createTemp = require('./createTemp');

/**
 * Expose VuePressApp.
 */

export default class App {
  /**
   * Instantiate the app context with a new API
   *
   * @param {string} sourceDir
   * @param {{
   *  plugins: pluginsConfig,
   *  theme: themeNameConfig
   *  temp: string
   * }} options
   */

  constructor(options = {}) {
    this.isProd = process.env.NODE_ENV === 'production';
    this.options = options;
    this.sourceDir = this.options.sourceDir || path.join(__dirname, 'docs.fallback');
    logger.debug('sourceDir', this.sourceDir);
    if (!fs.existsSync(this.sourceDir)) {
      logger.warn(`Source directory doesn't exist: ${chalk.yellow(this.sourceDir)}`);
    }

    this.vuepressDir = path.resolve(this.sourceDir, '.vuepress');
    this.libDir = path.join(__dirname, '../');
  }

  /**
   * Resolve user config and initialize.
   *
   * @returns {Promise<void>}
   * @api private
   */

  async resolveConfigAndInitialize() {
    if (this.options.siteConfig) {
      this.siteConfig = this.options.siteConfig;
    } else {
      let siteConfig = loadConfig(this.vuepressDir);
      if (isFunction(siteConfig)) {
        siteConfig = await siteConfig(this);
      }
      this.siteConfig = siteConfig;
    }

    // TODO custom cwd.
    this.cwd = process.cwd();

    this.base = this.siteConfig.base || '/';
    this.themeConfig = this.siteConfig.themeConfig || {};

    // resolve tempPath
    const rawTemp = this.options.temp || this.siteConfig.temp;
    const { tempPath, writeTemp } = createTemp(rawTemp);
    this.tempPath = tempPath;
    this.writeTemp = writeTemp;

    // resolve outDir
    const rawOutDir = this.options.dest || this.siteConfig.dest;
    this.outDir = rawOutDir
      ? require('path').resolve(this.cwd, rawOutDir)
      : require('path').resolve(this.sourceDir, '.vuepress/dist');

    this.pages = []; // Array<Page>
    this.pluginAPI = new PluginAPI(this);
    this.ClientComputedMixinConstructor = ClientComputedMixin(this.getSiteData());
  }

  /**
   * A asynchronous method used to prepare the context of the current app. which
   * contains loading pages and plugins, apply plugins, etc.
   *
   * @returns {Promise<void>}
   * @api private
   */

  async process() {
    await this.resolveConfigAndInitialize();
    this.resolveTemplates();
    this.resolveGlobalLayout();

    this.applyInternalPlugins();
    this.pluginAPI.initialize();

    await this.resolvePages();

    await this.pluginAPI.applyAsyncOption('ready');
    await Promise.all([
      this.pluginAPI.applyAsyncOption('clientDynamicModules', this),
      this.pluginAPI.applyAsyncOption('enhanceAppFiles', this),
      this.pluginAPI.applyAsyncOption('globalUIComponents', this)
    ]);
  }

  /**
   * Apply internal plugins
   *
   * @api private
   */

  applyInternalPlugins() {
    this.pluginAPI
      // internl core plugins
      .use(require('./internal-plugins/routes'))
      .use(require('./internal-plugins/enhanceApp'))
      .use(require('./internal-plugins/layoutComponents'))
      .use(require('./internal-plugins/pageComponents'))
      .use('@vuepress/register-components', {
        componentsDir: [path.resolve(this.sourceDir, '.vuepress/components')]
      });
  }

  /**
   * Make template configurable
   *
   * Resolving Priority (devTemplate as example):
   *
   *   1. siteConfig.devTemplate
   *   2. `dev.html` located at .vuepress/templates
   *   3. themeEntryFile.devTemplate
   *   4. default devTemplate
   *
   * @api private
   */

  resolveTemplates() {
    this.devTemplate = this.resolveCommonAgreementFilePath('devTemplate', {
      defaultValue: this.getLibFilePath('../../client/index.dev.html')
    });

    logger.debug(`DEV Template File: ${chalk.gray(this.devTemplate)}`);
  }

  /**
   * resolve global layout
   *
   * @returns {string}
   * @api private
   */

  resolveGlobalLayout() {
    this.globalLayout = this.resolveCommonAgreementFilePath('globalLayout', {
      defaultValue: this.getLibFilePath('../../client/components/GlobalLayout.vue'),
      siteAgreement: `components/GlobalLayout.vue`,
      themeAgreement: `layouts/GlobalLayout.vue`
    });

    logger.debug(`globalLayout: ${chalk.gray(this.globalLayout)}`);
  }

  /**
   * Resolve a path-type config.
   *
   * @param {string} configKey
   * @param {string} defaultValue an absolute path
   * @param {string} siteAgreement a relative path to vuepress dir
   * @param {string} themeAgreement a relative path to theme dir
   * @returns {string | void}
   */

  resolveCommonAgreementFilePath(configKey, { defaultValue }) {
    return fsExistsFallback([defaultValue].map((v) => v));
  }

  /**
   * Find all page source files located in sourceDir
   *
   * @returns {Promise<void>}
   * @api private
   */

  async resolvePages() {
    // resolve pageFiles
    const patterns = this.siteConfig.patterns ? this.siteConfig.patterns : ['**/*.md', '**/*.vue'];
    patterns.push('!.vuepress', '!node_modules');

    if (this.siteConfig.dest) {
      // #654 exclude dest folder when dest dir was set in
      // sourceDir but not in '.vuepress'
      const outDirRelative = path.relative(this.sourceDir, this.outDir);
      if (!outDirRelative.includes('..')) {
        patterns.push(`!${outDirRelative}`);
      }
    }
    const pageFiles = sort(await globby(patterns, { cwd: this.sourceDir }));

    await Promise.all(
      pageFiles.map(async (relative) => {
        const filePath = path.resolve(this.sourceDir, relative);
        await this.addPage({ filePath, relative });
      })
    );
  }

  /**
   * Add a page
   *
   * @returns {Promise<void>}
   * @api public
   */

  async addPage(options) {
    options.permalinkPattern = this.siteConfig.permalink;
    options.extractHeaders = this.siteConfig.markdown && this.siteConfig.markdown.extractHeaders;
    const page = new Page(options, this);
    const index = this.pages.findIndex(({ path }) => path === page.path);
    if (index >= 0) {
      // Override a page if corresponding path already exists
      logger.warn(`Override existing page ${chalk.yellow(page.path)}.`);
      this.pages.splice(index, 1, page);
    } else {
      this.pages.push(page);
    }
  }

  /**
   * Resolve the absolute path of a site-level agreement file,
   * return `undefined` when it doesn't exists.
   *
   * @param {string} filepath
   * @returns {string|undefined}
   */

  resolveSiteAgreementFile(filepath) {
    return path.resolve(this.vuepressDir, filepath);
  }

  /**
   * Get the data to be delivered to the client.
   *
   * @returns {{
   *  title: string,
   *  description: string,
   *  base: string,
   *  pages: Page[],
   *  themeConfig: ThemeConfig,
   *  locales: Locales
   * }}
   * @api public
   */

  getSiteData() {
    const { locales } = this.siteConfig;
    if (locales) {
      Object.keys(locales).forEach((path) => {
        locales[path].path = path;
      });
    }

    return {
      title: this.siteConfig.title || '',
      description: this.siteConfig.description || '',
      base: this.base,
      headTags: this.siteConfig.head || [],
      pages: this.pages.map((page) => page.toJson()),
      themeConfig: this.siteConfig.themeConfig || {},
      locales
    };
  }

  /**
   * Get file path in core lib
   *
   * @param relative
   * @returns {string}
   * @api public
   */

  getLibFilePath(relative) {
    return path.join(this.libDir, relative);
  }

  /**
   * Launch a dev process with current app context.
   *
   * @returns {Promise<App>}
   * @api public
   */

  async dev() {
    this.devProcess = new DevProcess(this);
    await this.devProcess.process();
    const error = await new Promise((resolve) => {
      try {
        this.devProcess
          .on('fileChanged', ({ type, target }) => {
            console.log(
              `Reload due to ${chalk.red(type)} ${chalk.cyan(
                path.relative(this.sourceDir, target)
              )}`
            );
            this.process();
          })
          .createServer()
          .listen(resolve);
      } catch (err) {
        resolve(err);
      }
    });
    if (error) {
      throw error;
    }
    return this;
  }

  /**
   * Launch a build process with current app context
   *
   * @returns {Promise<App>}
   * @api public
   */

  async build() {
    this.buildProcess = new BuildProcess(this);
    await this.buildProcess.process();
    await this.buildProcess.render();
    return this;
  }
}
