/**
 * Module dependencies.
 */

import WebpackDevServer from 'webpack-dev-server';
import webpack from 'webpack';
import chokidar from 'chokidar';

import { EventEmitter } from 'events';
import { path, fs, logger } from '../../shared-utils';
import createClientConfig from '../webpack/createClientConfig';

/**
 * Resolve host.
 *
 * @param {string} host user's host
 * @returns {{displayHost: string, host: string}}
 */

function resolveHost(host: string) {
  const defaultHost = '0.0.0.0';
  // eslint-disable-next-line no-param-reassign
  host = host || defaultHost;
  const displayHost = host === defaultHost ? 'localhost' : host;
  return {
    displayHost,
    host
  };
}

/**
 * Resolve port.
 *
 * @param {number} port user's port
 * @returns {Promise<number>}
 */

async function resolvePort(port) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const portfinder = require('portfinder');
  // eslint-disable-next-line radix
  portfinder.basePort = parseInt(port) || 8080;
  // eslint-disable-next-line no-param-reassign
  port = await portfinder.getPortPromise();
  return port;
}

export default class DevProcess extends EventEmitter {
  context: any;

  pagesWatcher: chokidar.FSWatcher = new chokidar.FSWatcher();

  watchFiles: string[] = [];

  configWatcher: chokidar.FSWatcher = new chokidar.FSWatcher();

  host: any;

  displayHost: any;

  port: any;

  webpackConfig: any;

  server: any;

  constructor(context: any) {
    super();
    this.context = context;
  }

  /**
   * Prepare essential data for launch dev server.
   */

  async process() {
    this.watchSourceFiles();
    this.watchUserConfig();
    this.setupDebugTip();
    await this.resolvePort();
    await this.resolveHost();
    this.prepareWebpackConfig();
    return this;
  }

  /**
   * Hande file's update, need to re-prepare app context.
   *
   * @param {string} type
   * @param {string} target
   */

  handleUpdate(type: string, target: string) {
    logger.debug(type, target);
    if (!path.isAbsolute(target)) {
      // eslint-disable-next-line no-param-reassign
      target = path.join(this.context.sourceDir, target);
    }
    if (target.endsWith('.js')) {
      // Bust cache.
      delete require.cache[target];
    }
    this.emit('fileChanged', {
      type,
      target
    });
  }

  /**
   * Watch user's source document files.
   */

  watchSourceFiles() {
    // watch add/remove of files
    this.pagesWatcher = chokidar.watch(['components/**/*.vue'], {
      cwd: this.context.sourceDir,
      ignored: ['node_modules'],
      ignoreInitial: true
    });
    this.pagesWatcher.on('add', (target) => this.handleUpdate('add', target));
    this.pagesWatcher.on('unlink', (target) => this.handleUpdate('unlink', target));
  }

  /**
   * Watch user's config files and extra files.
   */

  watchUserConfig() {
    this.watchFiles = ['./config.js'];

    logger.debug('watchFiles', this.watchFiles);

    this.configWatcher = chokidar.watch(this.watchFiles, {
      cwd: this.context.sourceDir,
      ignoreInitial: true
    });

    this.configWatcher.on('change', (target) => this.handleUpdate('change', target));
  }

  /**
   * Resolve used port
   */

  async resolvePort() {
    this.port = await resolvePort(this.context.options.port || 8080);
  }

  /**
   * Resolve used host
   */

  async resolveHost() {
    const { host, displayHost } = await resolveHost(this.context.options.host || 'localhost');
    this.host = host;
    this.displayHost = displayHost;
  }

  /**
   * Set up a shortcut to debug context under dev.
   */

  setupDebugTip() {
    // debug in a running dev process.
    // eslint-disable-next-line no-unused-expressions
    process.stdin &&
      process.stdin.on('data', (chunk) => {
        const parsed = chunk.toString('utf-8').trim();
        if (parsed === '*') {
          console.log(Object.keys(this.context));
        }
        if (this.context[parsed]) {
          console.log(this.context[parsed]);
        }
      });
  }

  /**
   * Prepare webpack for dev process.
   */

  prepareWebpackConfig() {
    // resolve webpack config
    let config = createClientConfig(this.context);

    config
      .plugin('html')
      // using a fork of html-webpack-plugin to avoid it requiring webpack
      // internals from an incompatible version.
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      .use(require('vuepress-html-webpack-plugin'), [
        {
          template: this.context.devTemplate
        }
      ]);

    // @ts-ignore
    config = config.toConfig();
    this.webpackConfig = config;
  }

  /**
   * Create dev server
   * @returns {module.DevProcess}
   */

  createServer() {
    const contentBase = path.resolve(this.context.sourceDir, './public');

    const serverConfig = {
      disableHostCheck: true,
      compress: true,
      clientLogLevel: 'error',
      hot: true,
      quiet: true,
      headers: {
        'access-control-allow-origin': '*'
      },
      open: this.context.options.open,
      proxy: this.context.appConfig.proxy || {},
      publicPath: this.context.base,
      watchOptions: {
        ignored: [
          (x: string | any[]) => {
            if (x.includes(this.context.tempPath)) {
              return false;
            }
            return /node_modules/.test(x);
          }
        ]
      },
      historyApiFallback: {
        disableDotRule: true,
        rewrites: [{ from: /./, to: path.posix.join(this.context.base, 'index.html') }]
      },
      overlay: false,
      host: this.host,
      contentBase,
      before: (app: any) => {
        if (fs.existsSync(contentBase)) {
          app.use(this.context.base, require('express').static(contentBase));
        }
      },
      after: (app: any, server: any) => {
        this.context.pluginAPI.applySyncOption('afterDevServer', app, server);
      }
    };

    WebpackDevServer.addDevServerEntrypoints(this.webpackConfig, serverConfig);

    const compiler = webpack(this.webpackConfig);
    this.server = new WebpackDevServer(compiler, serverConfig);
    return this;
  }

  /**
   * delegate listen call.
   *
   * @param callback handler when connection is ready.
   * @returns {module.DevProcess}
   */

  listen(callback: (arg0: any) => void) {
    this.server.listen(this.port, this.host, (err: any) => {
      if (typeof callback === 'function') {
        callback(err);
      }
    });
    return this;
  }
}
