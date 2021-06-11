import chalk from 'chalk';
import ora from 'ora';
import type { PluginOptions } from './index';
import { commonDeps, configDeps, tsDeps, pluginDeps, DeafultSharedEslintConfig } from './config';
import { installSaveDev } from './utils/npm-utils';
import { Logger } from './logger';

const installOraInstance = ora('install');

export default async (options: PluginOptions): Promise<void> => {
  try {
    const commonDenps = Object.keys(commonDeps);
    for (let index = 0; index < commonDenps.length; index++) {
      const dep = commonDenps[index];
      installOraInstance.start(`安装 eslint 依赖\n${dep}@${commonDeps[dep]}`);
      await installSaveDev(dep, commonDeps[dep]);
      installOraInstance.clear();
    }
    installOraInstance.succeed('安装 eslint 依赖');

    // 安装默认的es6配置集
    const configDenps = Object.keys(configDeps);
    for (let index = 0; index < configDenps.length; index++) {
      const dep = configDenps[index];
      installOraInstance.start(`安装 eslint es6 配置集\n${dep}@${configDeps[dep]}`);
      await installSaveDev(dep, configDeps[dep]);
      installOraInstance.clear();
    }

    // 安装weining官方统一eslint配置集
    const shareDenps = Object.keys(DeafultSharedEslintConfig);
    for (let index = 0; index < shareDenps.length; index++) {
      const dep = shareDenps[index];
      installOraInstance.start(
        `安装 eslint @winfe 配置集\n${dep}@${DeafultSharedEslintConfig[dep]}`
      );
      await installSaveDev(dep, DeafultSharedEslintConfig[dep]);
      installOraInstance.clear();
    }

    // 安装项目特有的配置集
    const proPlugin = pluginDeps[options.env === 'node' ? 'node' : 'vue'];
    const proDenps = Object.keys(proPlugin);
    for (let index = 0; index < proDenps.length; index++) {
      const dep = proDenps[index];
      installOraInstance.start(`安装 eslint env 配置集\n${dep}@${proPlugin[dep]}`);
      await installSaveDev(dep, proPlugin[dep]);
      installOraInstance.clear();
    }

    // 安装ts相关的配置集
    const tsDenps = Object.keys(tsDeps);
    for (let index = 0; index < tsDenps.length; index++) {
      const dep = tsDenps[index];
      installOraInstance.start(`安装 eslint ts 配置集\n${dep}@${tsDeps[dep]}`);
      await installSaveDev(dep, tsDeps[dep]);
      installOraInstance.clear();
    }

    installOraInstance.succeed('安装 eslint 配置集');
  } catch (error) {
    Logger.error(chalk.red(`${error}`));
    process.exit(0);
  }
};
