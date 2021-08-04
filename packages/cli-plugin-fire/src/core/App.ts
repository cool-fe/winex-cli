/* eslint-disable node/no-missing-require */
/* eslint-disable @typescript-eslint/no-var-requires */
/**
 * Module dependencies.
 */

import { fs, path, logger, chalk, globby, fallback, datatypes } from '../shared-utils';
import Page from './Page';
import PluginAPI from './plugin-api';
import DevProcess from './dev';
import createTemp from './createTemp';
import loadConfig from './loadConfig';

type Options = {
  sourceDir?: string;
  patterns?: string[];
  dest?: string;
  base?: string;
  temp?: string;
  appConfig?: any;
  plugins?: any[];
};

const { fsExistsFallback } = fallback;
const { isFunction } = datatypes;

export default class App {
  isProd: boolean;

  options: Options;

  appConfig: any;

  sourceDir: any;

  libDir: any;

  cwd: string | undefined;

  base: any;

  tempPath: any;

  writeTemp: any;

  outDir: any;

  pages!: any[];

  pluginAPI: any;

  devTemplate: any;

  globalLayout: any;

  devProcess: any;

  constructor(options: Options = {}) {
    this.isProd = process.env.NODE_ENV === 'production';
    this.options = options;
    this.sourceDir = this.options.sourceDir || process.cwd();
    logger.debug('sourceDir', this.sourceDir);
    if (!fs.existsSync(this.sourceDir)) {
      logger.warn(`Source directory doesn't exist: ${chalk.yellow(this.sourceDir)}`);
    }

    this.libDir = path.join(__dirname, '../../');
  }

  /**
   * Resolve user config and initialize.
   *
   * @returns {Promise<void>}
   * @api private
   */

  async resolveConfigAndInitialize() {
    if (this.options.appConfig) {
      this.appConfig = this.options.appConfig;
    } else {
      let appConfig = loadConfig(this.sourceDir);
      if (isFunction(appConfig)) {
        appConfig = await appConfig(this);
      }
      this.appConfig = appConfig;
    }

    // TODO custom cwd.
    this.cwd = process.cwd();

    this.base = this.options.base || '/';

    // resolve tempPath
    const rawTemp = this.options.temp;
    const { tempPath, writeTemp } = createTemp(rawTemp);
    this.tempPath = tempPath;
    this.writeTemp = writeTemp;

    // resolve outDir
    const rawOutDir = this.options.dest || path.resolve(this.cwd, 'dist');
    this.outDir = rawOutDir
      ? require('path').resolve(this.cwd, rawOutDir)
      : require('path').resolve(this.sourceDir, './dist');

    this.pages = []; // Array<Page>
    this.pluginAPI = new PluginAPI(this);
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
    this.applyUserPlugins();
    this.pluginAPI.initialize();

    await this.resolvePages();

    await this.pluginAPI.applyAsyncOption('additionalPages', this);

    await Promise.all(
      this.pluginAPI.getOption('additionalPages').appliedValues.map(async (options: any) => {
        await this.addPage(options);
      })
    );
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
      .use(require('./internal-plugins/register-components'), {
        componentsDir: [path.resolve(this.sourceDir, './')]
      });
  }

  /**
   * Apply user plugins
   *
   * @api private
   */

  applyUserPlugins() {
    this.pluginAPI.useByPluginsConfig(this.options.plugins);
    this.pluginAPI.use({ ...this.appConfig, name: '@winfe/internal-app-config' });
  }

  resolveTemplates() {
    this.devTemplate = this.resolveCommonAgreementFilePath('devTemplate', {
      defaultValue: this.getLibFilePath('client/index.dev.html')
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
      defaultValue: this.getLibFilePath('client/components/GlobalLayout.vue')
    });

    logger.debug(`globalLayout: ${chalk.gray(this.globalLayout)}`);
  }

  resolveCommonAgreementFilePath(configKey: string, { defaultValue }: { defaultValue: any }) {
    return fsExistsFallback([defaultValue].map((v) => v));
  }

  async resolvePages() {
    // resolve pageFiles
    const patterns = this.options.patterns
      ? this.options.patterns
      : ['src/index.vue', 'index.js', 'index.vue'];
    patterns.push('!.tmp', '!node_modules');

    if (this.options.dest) {
      const outDirRelative = path.relative(this.sourceDir, this.outDir);
      if (!outDirRelative.includes('..')) {
        patterns.push(`!${outDirRelative}`);
      }
    }
    const pageFiles = await globby(patterns, { cwd: this.sourceDir });

    await Promise.all(
      pageFiles.map(async (relative: any) => {
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

  async addPage(options: { filePath: any; relative: any }) {
    const page = new Page(options, this);
    this.pluginAPI.getOption('extendPageData');
    // eslint-disable-next-line @typescript-eslint/no-shadow
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
   * Get file path in core lib
   *
   * @param relative
   * @returns {string}
   * @api public
   */

  getLibFilePath(relative: string) {
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
          //@ts-ignore
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
    return error;
  }
}
