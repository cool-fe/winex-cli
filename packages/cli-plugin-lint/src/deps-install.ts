import chalk from "chalk";
import type { PluginOptions } from "./index";
import {
  commonDeps,
  configDeps,
  tsDeps,
  pluginDeps,
  DeafultSharedEslintConfig,
} from "./config";
import { installSaveDev } from "./utils/npm-utils";
import { Logger } from "./logger";
import ora from "ora";

const installOraInstance = ora("install");

export const installDeps = async (options: PluginOptions) => {
  Logger.info(chalk.green("正在安装 eslint 相关依赖 ..."));
  try {
    for (const dep in commonDeps) {
      installOraInstance.start(dep + "@" + commonDeps[dep]);
      await installSaveDev(dep, commonDeps[dep]);
      installOraInstance.succeed(dep + "@" + commonDeps[dep]);
    }

    Logger.info(chalk.green("正在安装配置集 eslint..."));
    // 安装默认的es6配置集
    for (const dep in configDeps.default) {
      installOraInstance.start(dep + "@" + configDeps.default[dep]);
      await installSaveDev(dep, configDeps.default[dep]);
      installOraInstance.succeed(dep + "@" + configDeps.default[dep]);
    }

    // 安装weining官方统一eslint配置集
    for (const dep in DeafultSharedEslintConfig) {
      installOraInstance.start(dep);
      await installSaveDev(dep, DeafultSharedEslintConfig[dep]);
      installOraInstance.succeed(dep);
    }

    // 安装项目特有的配置集
    const proPlugin = pluginDeps[options.env === "node" ? "node" : "vue"];
    for (const dep in proPlugin) {
      installOraInstance.start(dep);
      await installSaveDev(dep, proPlugin[dep]);
      installOraInstance.succeed(dep);
    }

    // 安装ts相关的配置集
    if (options.typescript) {
      for (const dep in tsDeps) {
        installOraInstance.start(dep);
        await installSaveDev(dep, tsDeps[dep]);
        installOraInstance.succeed(dep);
      }
    }
  } catch (error) {
    Logger.error(chalk.green(`正在安装相关依赖失败，${error}`));
  }
};
