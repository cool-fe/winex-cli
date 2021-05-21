import { BasePlugin } from "@winfe/cli-core";
import { createCliPrompt } from "./prompts";
import { installDeps } from "./deps-install";
import configEslintRC from "./install-config";
import configPrettierRC from "./add-prettier-config";
import configEditorrRC from "./add-editor-config";
import interEslintToCI from "./ci";

export enum HookEngine {
  none = "none",
  husky = "husky",
  // yorkie = "yorkie",
  winfe = "winfe",
}

export type PluginOptions = {
  env: "browser" | "node";
  typescript: boolean;
  pm: "yarn" | "npm";
  hookEngine?: HookEngine;
  ci?: boolean;
};

export default class LintPlugin extends BasePlugin {
  commands = {
    lint: {
      usage: "init or upgrade eslint prettier editorconfig ",
      lifecycleEvents: ["init"],
      options: {
        "--env [browser]": {
          usage: "代码运行环境：node、browser",
          config: {},
        },
        "--typescript": {
          usage: "是否支持typescript",
        },
        "--pm [pm]": {
          usage: "包管理器",
          config: {
            default: "yarn",
          },
        },
        "--hook-engine [husky]": {
          usage: "注册git hook的引擎，husky、yorkie、git-hooks、winfe 等",
          config: {
            default: "husky",
          },
        },
        "--ci": {
          usage: "是否在ci/cd中",
        },
        "--verbose": {
          usage: "是否显示详细的日志信息",
        },
      },
    },
  };

  answer: object = {};

  hooks = {
    "before:lint:init": async (content: any) => {
      // 安装相关依赖
      const {
        env: _env,
        typescript: _ts,
        pm: _pm,
        ci,
      } = content?.parsedOptions?.options as PluginOptions;
      if (ci) return;
      const anwser = await createCliPrompt<PluginOptions>({
        env: _env,
        typescript: _ts,
        pm: _pm,
      });
      this.answer = anwser;
      await installDeps(anwser);
    },
    "lint:init": async (content: any) => {
      // 配置eslint
      const { env, typescript, pm: _pm } = this?.answer as PluginOptions;
      await configEslintRC(env === "node" ? "node" : "vue", typescript);
      // 配置prettier
      await configPrettierRC();
      // 配置editorconfig
      await configEditorrRC();
    },
    "after:lint:init": async (content: any) => {
      // 修改package.json，结合--hook-engine对eslint、prettier、editorconfig做设置
      const { hookEngine = HookEngine["husky"] } = content?.parsedOptions
        ?.options as PluginOptions;
      const { env, typescript, pm } = this?.answer as PluginOptions;
      await interEslintToCI(hookEngine, env, typescript, pm);
    },
  };
}
