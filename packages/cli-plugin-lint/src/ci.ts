/**
 * @author dashixiong
 * @description integrate eslint into ci flow, provide husky & yorkie & winfe solutions
 */

import { installSaveDev } from "./utils/npm-utils";
import { winfeCiDeps, huskyCiDeps } from "./config";
import * as fs from "fs";
import chalk from "chalk";
import fileUtil from "./utils/file";
import * as _ from "lodash";
import { Logger } from "./logger";
import { HookEngine } from "./index";
import ora from "ora";

const installOraInstance = ora("install");

/**
 * 配置 package.json
 * @param eslintPath eslint检查路径
 */
function configPackage(eslintPath: string) {
  const packagePath = `${process.cwd()}/package.json`;
  const packageExist = fileUtil.checkExist(packagePath, false);
  if (packageExist) {
    // 如果package.json存在，进行修改
    const fileContent = fs.readFileSync(packagePath, "utf-8");
    const fileJSON = JSON.parse(fileContent);
    // 增加 precommit hook
    fileJSON.scripts = _.assign(fileJSON.scripts || {}, {
      precommit: "lint-staged",
    });
    // 配置 lint-staged
    fileJSON["lint-staged"] = {
      [eslintPath]: "eslint",
    };
    const fileNewContent = JSON.stringify(fileJSON, null, 2);
    // 写入
    fs.writeFileSync(packagePath, fileNewContent);
    Logger.info(
      chalk.yellow(
        `当前lint文件为"${eslintPath}",可根据项目具体情况调整(见package.json)`
      )
    );
  } else {
    // 如果 package.json 不存在，初始化失败，提示用户进行 npm 初始化
    Logger.error(
      chalk.red("ERROR: 未找到package.json文件，请使用 npm init 进行初始化")
    );
    throw new Error("package.json not found");
  }
}

/**
 * 集成eslint到工作流中
 * @param solutionType 解决方案类型
 * @param projectType 项目类型
 */
export default async function interEslintToCI(
  hookEngine: HookEngine,
  projectType: string,
  supportTypeScript: boolean,
  pmTool?: string
) {
  if (hookEngine === HookEngine["winfe"]) {
    for (const dep in winfeCiDeps) {
      installOraInstance.start(dep + "@" + winfeCiDeps[dep]);
      await installSaveDev(dep, winfeCiDeps[dep], pmTool);
      installOraInstance.succeed(dep + "@" + winfeCiDeps[dep]);
    }
  } else {
    for (const dep in huskyCiDeps) {
      installOraInstance.start(dep + "@" + huskyCiDeps[dep]);
      await installSaveDev(dep, huskyCiDeps[dep], pmTool);
      installOraInstance.succeed(dep + "@" + huskyCiDeps[dep]);
    }
    const suffix = ["js"];
    projectType === "vue" && suffix.push("vue");
    supportTypeScript && suffix.push("ts");
    const lintScript = suffix.length > 1 ? `{${suffix.join(",")}}` : suffix[0];
    const eslintPath = `*.${lintScript}`;
    configPackage(eslintPath);
  }
}
