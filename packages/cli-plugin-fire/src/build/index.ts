import webpack from 'webpack';
import chalk from 'chalk';
import CreateWebpackCompoConfig from './webpack.component';

export default (dir = [process.cwd()]): Promise<void> =>
  new Promise((resolve, reject) => {
    CreateWebpackCompoConfig(dir).forEach(conf => {
      webpack(conf, (err, stats) => {
        if (!err) {
          console.log(chalk.green('webpack build success'));
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
          resolve();
        } else {
          console.log('err:', err);
          console.log(err.stack && err.stack);
          reject(err);
        }
      });
    })
  })
  
  
