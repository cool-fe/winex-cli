import webpack from 'webpack';
import chalk from 'chalk';
// import fse from "fs-extra";
import CreateWebpackCompoConfig from './webpack.component';

// const pkg = require(process.cwd() + "/package.json");
export default (dir = [process.cwd()]): Promise<void> =>
  new Promise<void>((resolve, reject) => {
    CreateWebpackCompoConfig(dir).forEach(conf => {
      webpack(conf, (err, stats) => {
        if (!err) {
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
          console.log(chalk.green('webpack build success'));
          // fse.copy("lib", `dist/${pkg.version}`);
          resolve();
        } else {
          console.log('err:', err);
          console.log(err.stack && err.stack);
          reject(err);
        }
      });
    })
    
  });
