import path from 'path';
import webpack from 'webpack';
import * as config from './webpack.base';

const createSingleConfig = (dir: string): webpack.Configuration => {
  const WebpackComConfig: webpack.Configuration = {
    mode: 'production',
    entry: path.resolve(dir, './index.js'),
    output: {
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

  return WebpackComConfig;
};

export default function CreateWebpackCompoConfig(
  multiDir = [process.cwd()]
): webpack.Configuration[] {
  return multiDir.map((dir) => createSingleConfig(dir));
}
