/* eslint-disable no-use-before-define */
/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable complexity */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Module dependencies.
 */
import Config from 'webpack-chain'
import {VueLoaderPlugin} from 'vue-loader'
import CSSExtractPlugin from 'mini-css-extract-plugin'
import { path, env } from '../../shared-utils';

/**
 * Expose createBaseConfig method.
 */

export default function createBaseConfig(
  context: {
    getLibFilePath?: any;
    sourceDir?: any;
    outDir?: any;
    base?: any;
    tempPath?: any;
    cacheDirectory?: any;
    cacheIdentifier?: any;
    options?: any;
    pluginAPI?: any;
  },
  isServer?: any
) {
  const { sourceDir, outDir, base: publicPath, tempPath, pluginAPI } = context;

  const isProd = process.env.NODE_ENV === 'production';
  const inlineLimit = 10000;

  const config = new Config();

  config
    .mode(isProd && !env.isDebug ? 'production' : 'development')
    .output.path(outDir)
    .filename(isProd ? 'assets/js/[name].[chunkhash:8].js' : 'assets/js/[name].js')
    .publicPath(publicPath);

  if (env.isDebug) {
    config.devtool('source-map');
  } else if (!isProd) {
    config.devtool('cheap-module-eval-source-map');
  }

  // eslint-disable-next-line no-use-before-define
  const modulePaths = getModulePaths();
  const clientDir = context.getLibFilePath('client');

  config.resolve
    .set('symlinks', true)
    .alias.set('@source', sourceDir)
    .set('@client', clientDir)
    .set('@app', clientDir)
    .set('@temp', tempPath)
    .set('@dynamic', path.resolve(tempPath, 'dynamic'))
    .set('@internal', path.resolve(tempPath, 'internal'))
    .end()
    .extensions.merge(['.js', '.jsx', '.vue', '.json', '.styl'])
    .end()
    .modules.merge(modulePaths);

  config.resolveLoader.set('symlinks', true).modules.merge(modulePaths);

  config.module.noParse(/^(vue|vue-router|vuex|vuex-router-sync)$/);

  function applyVuePipeline(rule: any) {
    rule
      .use('vue-loader')
      .loader('vue-loader')
      .options({
        compilerOptions: {
          preserveWhitespace: true
        }
      });
  }

  const vueRule = config.module.rule('vue').test(/\.vue$/);

  applyVuePipeline(vueRule);

  config.module
    .rule('pug')
    .test(/\.pug$/)
    .use('pug-plain-loader')
    .loader('pug-plain-loader')
    .end();

  const libDir = path.join(__dirname, '..');
  config.module
    .rule('js')
    .test(/\.jsx?$/)
    .exclude.add((filePath: string) => {
      // transpile lib directory
      if (filePath.startsWith(libDir)) {
        return false;
      }

      // transpile js in vue files and md files
      if (/\.(vue|md)\.js$/.test(filePath)) {
        return false;
      }

      if (/(@fire[\/\\][^\/\\]*|fire-[^\/\\]*)[\/\\](?!node_modules).*\.js$/.test(filePath)) {
        return false;
      }

      // transpile @babel/runtime until fix for babel/babel#7597 is released
      if (filePath.includes(path.join('@babel', 'runtime'))) {
        return false;
      }

      // don't transpile node_modules
      return /node_modules/.test(filePath);
    })
    .end()
    .use('babel-loader')
    .loader('babel-loader')
    .options({
      // do not pick local project babel config (.babelrc)
      babelrc: false,
      // do not pick local project babel config (babel.config.js)
      // ref: http://babeljs.io/docs/en/config-files
      configFile: false,
      presets: [
        [
          require.resolve('@vue/babel-preset-app'),
          {
            entryFiles: [
              path.resolve(
                __dirname,
                '../../../client',
                isServer ? 'serverEntry.js' : 'clientEntry.js'
              )
            ]
          }
        ]
      ]
    });

  config.module
    .rule('images')
    .test(/\.(png|jpe?g|gif)(\?.*)?$/)
    .use('url-loader')
    .loader('url-loader')
    .options({
      limit: inlineLimit,
      name: `assets/img/[name].[hash:8].[ext]`
    });

  // do not base64-inline SVGs.
  // https://github.com/facebookincubator/create-react-app/pull/1180
  config.module
    .rule('svg')
    .test(/\.(svg)(\?.*)?$/)
    .use('file-loader')
    .loader('file-loader')
    .options({
      name: `assets/img/[name].[hash:8].[ext]`
    });

  config.module
    .rule('media')
    .test(/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/)
    .use('url-loader')
    .loader('url-loader')
    .options({
      limit: inlineLimit,
      name: `assets/media/[name].[hash:8].[ext]`
    });

  config.module
    .rule('fonts')
    .test(/\.(woff2?|eot|ttf|otf)(\?.*)?$/i)
    .use('url-loader')
    .loader('url-loader')
    .options({
      limit: inlineLimit,
      name: `assets/fonts/[name].[hash:8].[ext]`
    });

  function createCSSRule(lang: string, test: RegExp, loader?: string, options?: any) {
    const baseRule = config.module.rule(lang).test(test).sideEffects(true);
    const modulesRule = baseRule.oneOf('modules').resourceQuery(/module/);
    const normalRule = baseRule.oneOf('normal');

    applyLoaders(modulesRule, true);
    applyLoaders(normalRule, false);

    function applyLoaders(rule: any, modules: boolean) {
      if (!isServer) {
        if (isProd) {
          rule.use('extract-css-loader').loader(CSSExtractPlugin.loader);
        } else {
          rule.use('vue-style-loader').loader('vue-style-loader');
        }
      }

      rule.use('css-loader').loader('css-loader').options({
        modules,
        localIdentName: `[local]_[hash:base64:8]`,
        importLoaders: 1,
        sourceMap: !isProd,
        exportOnlyLocals: isServer
      });

      rule
        .use('postcss-loader')
        .loader('postcss-loader')
        .options({ plugins: [require('autoprefixer')], sourceMap: !isProd });

      if (loader) {
        rule.use(loader).loader(loader).options(options);
      }
    }
  }

  createCSSRule('css', /\.css$/);
  createCSSRule('postcss', /\.p(ost)?css$/);
  createCSSRule('scss', /\.scss$/, 'sass-loader');
  createCSSRule('scss', /\.scss$/, 'style-resources-loader', {
    patterns: [path.resolve(__dirname, "../../styles/index.scss")],
  });
  createCSSRule('sass', /\.sass$/, 'sass-loader', { indentedSyntax: true });
  createCSSRule('stylus', /\.styl(us)?$/, 'stylus-loader', {
    preferPathResolver: 'webpack'
  });
  createCSSRule('scss', /\.scss$/, 'style-resources-loader', {
    patterns: [require.resolve('@winfe/theme-helper')],
  });

  config.plugin('vue-loader').use(VueLoaderPlugin);

  if (isProd && !isServer) {
    config.plugin('extract-css').use(CSSExtractPlugin, [
      {
        filename: 'assets/css/styles.[chunkhash:8].css'
      }
    ]);

    // ensure all css are extracted together.
    // since most of the CSS will be from the theme and very little
    // CSS will be from async chunks
    config.optimization.splitChunks({
      cacheGroups: {
        styles: {
          name: 'styles',
          // necessary to ensure async chunks are also extracted
          test: (m: { type: string }) => /css\/mini-extract/.test(m.type),
          chunks: 'all',
          enforce: true
        }
      }
    });
  }

  // inject constants
  config.plugin('injections').use(require('webpack/lib/DefinePlugin'), [
    {
      VUEPRESS_VERSION: JSON.stringify(require('../../../package.json').version),
      VUEPRESS_TEMP_PATH: JSON.stringify(tempPath)
    }
  ]);

  pluginAPI.applySyncOption('define', config);
  pluginAPI.applySyncOption('alias', config);
  return config;
};

function getModulePaths() {
  return module.paths.concat([path.resolve(process.cwd(), 'node_modules')]);
}
