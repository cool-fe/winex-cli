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
  try {
    for (const dep in commonDeps) {
      installOraInstance.start(
        "安装 eslint 依赖\n" + dep + "@" + commonDeps[dep]
      );
      await installSaveDev(dep, commonDeps[dep]);
      installOraInstance.clear();
    }

    installOraInstance.succeed("安装 eslint 依赖");

    // 安装默认的es6配置集
    for (const dep in configDeps.default) {
      installOraInstance.start(
        "安装 eslint es6 配置集\n" + dep + "@" + configDeps.default[dep]
      );
      await installSaveDev(dep, configDeps.default[dep]);
      installOraInstance.clear();
    }

    // 安装weining官方统一eslint配置集
    for (const dep in DeafultSharedEslintConfig) {
      installOraInstance.start(
        "安装 eslint @winfe 配置集\n" +
          dep +
          "@" +
          DeafultSharedEslintConfig[dep]
      );
      await installSaveDev(dep, DeafultSharedEslintConfig[dep]);
      installOraInstance.clear();
    }

    // 安装项目特有的配置集
    const proPlugin = pluginDeps[options.env === "node" ? "node" : "vue"];
    for (const dep in proPlugin) {
      installOraInstance.start(
        "安装 eslint env 配置集\n" + dep + "@" + proPlugin[dep]
      );
      await installSaveDev(dep, proPlugin[dep]);
      installOraInstance.clear();
    }

    // 安装ts相关的配置集
    if (options.typescript) {
      for (const dep in tsDeps) {
        installOraInstance.start(
          "安装 eslint ts 配置集\n" + dep + "@" + tsDeps[dep]
        );
        await installSaveDev(dep, tsDeps[dep]);
        installOraInstance.clear();
      }
    }

    installOraInstance.succeed("安装 eslint 配置集");
  } catch (error) {
    Logger.error(chalk.red(`${error}`));
    process.exit(0);
  }
};
