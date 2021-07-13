import webpack from 'webpack';
import chalk from 'chalk';
import CreateWebpackCompoConfig from './webpack.component';

export default (dir = [process.cwd()]): Promise<void> =>
  new Promise<void>((resolve, reject) => {
    webpack(CreateWebpackCompoConfig(dir), (err, stats) => {
      if (!err) {
        console.log(chalk.green('webpack build success'));
        resolve();
        if (stats) {
          process.stdout.write(
            stats.toString({
              colors: true,
              modules: false,
              children: false,
              chunks: false,
              chunkModules: false
            })
          );
        }
      } else {
        console.log('err:', err);
        console.log(err.stack && err.stack);
        reject(err);
      }
    });
  });
