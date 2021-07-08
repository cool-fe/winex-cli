/* eslint-disable @typescript-eslint/ban-ts-comment */
import ProgressBarPlugin from 'progress-bar-webpack-plugin';
// @ts-ignore
import VueLoaderPlugin from 'vue-loader/lib/plugin';
import TerserPlugin from 'terser-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import assets from './assets'

// resolve
export const resolve = {
  extensions: ['.js', '.vue', '.json'],
  alias: {
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
    loader: "babel-loader",
    options: {
      presets: ["@babel/preset-env", "@vue/babel-preset-jsx"],
      plugins: [
        "@babel/plugin-transform-runtime",
        "@babel/plugin-proposal-class-properties",
      ],
    },
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
    use: [
      MiniCssExtractPlugin.loader,
      'css-loader',
      'resolve-url-loader',
      {
        loader: 'sass-loader',
        options: {
          sourceMap: true
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
  },
  ...assets()
];

//plugins
export const plugins = [
  new VueLoaderPlugin(), 
  new CleanWebpackPlugin(), 
  new ProgressBarPlugin(),
  new MiniCssExtractPlugin({
    filename: "index.css"
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
