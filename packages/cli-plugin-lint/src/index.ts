//@ts-ignore
import { BasePlugin } from "@winfe/cli-core";


export class LintPlugin extends BasePlugin {
  commands = {
    lint: {
      usage: "init or upgrade eslint prettier editorconfig ",
      lifecycleEvents: ["init"],
      options: {
          // 参数申明
      },
    },
  };

  hooks = {
    "before:lint:init":async (content:any) =>{
      // 安装相关依赖
      },
    "lint:init": async (content: any) => {
      // 配置eslint
      // 配置prettier
      // 配置editorconfig
    },
    "after:lint:init": async (content: any) => {
        // 修改package.json，结合--hook-engine对eslint、prettier、editorconfig做设置
      },
  };
}