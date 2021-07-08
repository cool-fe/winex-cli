import path from 'path';
import webpack from 'webpack';
import * as config from './webpack.base';
import loadFileConfig from './loadUserOptions'
import Config from 'webpack-chain'
import  { merge } from 'webpack-merge'
import { IFileConfig } from './interface';

const createSingleConfig = (dir: string): webpack.Configuration => {
  const WebpackComConfig: webpack.Configuration = {
    mode: 'production',
    entry: path.resolve(dir, './index.js'),
    output: {
      publicPath: "./",
      path: path.resolve(dir, './lib/'),
      filename: 'index.js',
      chunkFilename: '[id].js',
      libraryTarget: 'umd'
    },
    resolve: {
      extensions: ['.js', '.vue', '.json'],
      alias: config.alias,
      modules: ['node_modules']
    },
    externals: config.externals,
    optimization: config.optimization,
    module: {
      rules: config.rules
    },
    plugins: [...config.plugins]
  };

  const cwd: string = dir || process.cwd()
  const fileConfig:IFileConfig = loadFileConfig(cwd);
  const chainableConfig = new Config()
  let webpackChainFn = (config: any):void => {} 
  let configureWebpackFn = (config: webpack.Configuration):void => {} 

  if(fileConfig.chainWebpack) {
    webpackChainFn = fileConfig.chainWebpack
  }
  if(fileConfig.configureWebpack) {
    configureWebpackFn = fileConfig.configureWebpack
  }
  webpackChainFn(chainableConfig)
  let conf = chainableConfig.toConfig()
  const original = conf

  if(typeof configureWebpackFn === 'function') {
    const res: any = configureWebpackFn(conf)
    if(res) {
      conf = merge(config, res)
    }
  }
  if (conf !== original) {
    cloneRuleNames(
      conf.module && conf.module.rules,
      original.module && original.module.rules
    );
  }
  return merge(WebpackComConfig, conf);
};

export default function CreateWebpackCompoConfig(
  multiDir = [process.cwd()]
): webpack.Configuration[] {
  return multiDir.map((dir) => createSingleConfig(dir));
}

function cloneRuleNames(to:object, from:[any]): void {
  if (!to || !from) {
    return;
  }
  from.forEach((r, i) => {
    if (to[i]) {
      Object.defineProperty(to[i], "__ruleNames", {
        value: r.__ruleNames,
      });
      cloneRuleNames(to[i].oneOf, r.oneOf);
    }
  });
}
  
