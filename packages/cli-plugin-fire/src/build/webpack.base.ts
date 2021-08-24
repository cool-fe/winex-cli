/* eslint-disable @typescript-eslint/ban-ts-comment */
import ProgressBarPlugin from 'progress-bar-webpack-plugin';
// @ts-ignore
import VueLoaderPlugin from 'vue-loader/lib/plugin';
import TerserPlugin from 'terser-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
// resolve
export const resolve = {
  extensions: ['.js', '.vue', '.json'],
  alias: {}
};

// externals
export const externals = {
  vue: {
    root: 'Vue',
    commonjs: 'vue',
    commonjs2: 'vue',
    amd: 'vue'
  },
  "his-request": "HISREUEST",
  "vuex": "Vuex",
  "vue-router": "VueRouter",
  'element-ui': {
    root: 'element-ui',
    commonjs: 'element-ui',
    commonjs2: 'element-ui',
    amd: 'element-ui'
  },
  '@winfe/win-request': {
    root: 'winRequest',
    commonjs: 'win-request',
    commonjs2: 'win-request',
    amd: 'win-request'
  }
};

// rules
export const rules = [
  {
    test: /\.(js|jsx?|babel|es6)$/,
    // include: process.cwd(),
    exclude: /node_modules/,
    loader: 'babel-loader',
    options: {
      presets: ['@babel/preset-env', '@vue/babel-preset-jsx'],
      plugins: ['@babel/plugin-transform-runtime', '@babel/plugin-proposal-class-properties']
    }
  },
  {
    test: /\.vue$/,
    loader: 'vue-loader',
    options: {
      compilerOptions: {
        preserveWhitespace: false
      },
      cssModules: {
        localIdentName: '[path][name]---[local]---[hash:base64:5]',
        camelCase: true
      }
    }
  },
  {
    test: /\.(scss|css)$/,
    use: [
      MiniCssExtractPlugin.loader,
      {
        loader: 'css-loader',
        options: {
          modules: true,
          importLoaders: 1,
          localIdentName: '[hash:base64]'
        }
      },
      'resolve-url-loader',
      {
        loader: 'sass-loader',
        options: {
          sourceMap: true
        }
      },
      {
        loader: 'style-resources-loader',
        options: {
          patterns: [require.resolve('@winfe/theme-helper')]
        }
      }
    ]
  },
  {
    test: /\.html$/,
    loader: 'html-loader?minimize=false'
  },
  {
    test: /\.json$/,
    loader: 'json-loader'
  }
  // ...assets()
];

//plugins
export const plugins = [
  new VueLoaderPlugin(),
  new CleanWebpackPlugin(),
  new ProgressBarPlugin(),
  new MiniCssExtractPlugin({
    filename: 'index.css'
  })
];

//alias
export const alias = [];

// optimization
export const optimization = {
  minimize: true,
  minimizer: [
    new TerserPlugin({
      terserOptions: {
        output: {
          comments: false
        }
      }
    })
  ]
};
