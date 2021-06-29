/* eslint-disable @typescript-eslint/ban-ts-comment */
import ProgressBarPlugin from 'progress-bar-webpack-plugin';
//@ts-ignore
import VueLoaderPlugin from 'vue-loader/lib/plugin';
import TerserPlugin from 'terser-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import path from 'path';

// resolve
export const resolve = {
  extensions: ['.js', '.vue', '.json'],
  alias: {
    // "@": path.resolve(__dirname, "../../src"),
    // packages: path.resolve(__dirname, "../../packages")
  }
};

// externals
export const externals = {
  vue: {
    root: 'Vue',
    commonjs: 'vue',
    commonjs2: 'vue',
    amd: 'vue'
  },
  'element-ui': {
    root: 'element-ui',
    commonjs: 'element-ui',
    commonjs2: 'element-ui',
    amd: 'element-ui'
  }
};

// rules
export const rules = [
  {
    test: /\.(js|jsx?|babel|es6)$/,
    include: process.cwd(),
    exclude: /node_modules/,
    loader: 'babel-loader'
  },
  {
    test: /\.vue$/,
    loader: 'vue-loader',
    options: {
      compilerOptions: {
        preserveWhitespace: false
      }
    }
  },
  {
    test: /\.(scss|css)$/,
    loaders: ['style-loader', 'css-loader', 'sass-loader']
  },
  {
    test: /\.html$/,
    loader: 'html-loader?minimize=false'
  },
  {
    test: /\.(svg|otf|ttf|woff2?|eot|gif|png|jpe?g)(\?\S*)?$/,
    loader: 'url-loader',
    query: {
      esModule: false,
      limit: 10000,
      name: path.posix.join('static', '[name].[ext]')
    }
  },
  {
    test: /\.json$/,
    loader: 'json-loader'
  }
];

//plugins
export const plugins = [new VueLoaderPlugin(), new CleanWebpackPlugin(), new ProgressBarPlugin()];

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
