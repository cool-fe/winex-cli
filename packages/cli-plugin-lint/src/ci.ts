/**
 * @author dashixiong
 * @description integrate eslint into ci flow, provide husky & yorkie & winfe solutions
 */

import { installSaveDev } from "./utils/npm-utils";
import { winfeCiDeps, huskyCiDeps, lintstagedCiDeps } from "./config";
import fs from "fs";
import spawn from "cross-spawn";
import { resolve } from "path";
import chalk from "chalk";
import fileUtil from "./utils/file";
import * as _ from "lodash";
import { Logger } from "./logger";
import { HookEngine } from "./index";
import ora from "ora";

const LINT_STAGED_CONFIG_PATH = resolve(process.cwd(), "./.lintstagedrc.js");

const installOraInstance = ora("install");

/**
 * 配置 package.json
 * @param eslintPath eslint检查路径
 */
function mdifyConfigPackage() {
  const packagePath = `${process.cwd()}/package.json`;
  const packageExist = fileUtil.checkExist(packagePath, false);
  if (packageExist) {
    // 如果package.json存在，进行修改
    const fileContent = fs.readFileSync(packagePath, "utf-8");
    const fileJSON = JSON.parse(fileContent);
    // // 增加 precommit hook
    // fileJSON.scripts = _.assign(fileJSON.scripts || {}, {
    //   precommit: "lint-staged",
    // });
    // 配置 lint-staged
    // fileJSON["lint-staged"] = {
    //   [eslintPath]: "eslint",
    // };

    if (fileJSON["lint-staged"]) {
      delete fileJSON["lint-staged"];
    }

    const fileNewContent = JSON.stringify(fileJSON, null, 2);
    // 写入
    fs.writeFileSync(packagePath, fileNewContent);
  } else {
    // 如果 package.json 不存在，初始化失败，提示用户进行 npm 初始化
    Logger.error(
      chalk.red("ERROR: 未找到package.json文件，请使用 npm init 进行初始化")
    );
    throw new Error("package.json not found");
  }
}

function getConfigPackage() {
  const packagePath = `${process.cwd()}/package.json`;
  const packageExist = fileUtil.checkExist(packagePath, false);
  if (packageExist) {
    // 如果package.json存在，进行修改
    const fileContent = fs.readFileSync(packagePath, "utf-8");
    const fileJSON = JSON.parse(fileContent);

    if (fileJSON["lint-staged"]) {
      return fileJSON["lint-staged"];
    }
    return {};
  } else {
    // 如果 package.json 不存在，初始化失败，提示用户进行 npm 初始化
    Logger.info(
      chalk.green("未找到package.json文件，请使用 yarn init 进行初始化")
    );
  }
}

async function initHusky(pmTool: string) {
  const HUSKY_CONFIG_PATH = resolve(process.cwd(), "./.husky");
  const PRE_COMMIT_PATH = `${HUSKY_CONFIG_PATH}/pre-commit`;
  // install huksy
  for (const dep in huskyCiDeps) {
    installOraInstance.start(dep + "@" + huskyCiDeps[dep]);
    await installSaveDev(dep, huskyCiDeps[dep], pmTool);
    installOraInstance.succeed(dep + "@" + huskyCiDeps[dep]);
  }

  fs.rmdirSync(HUSKY_CONFIG_PATH, { recursive: true });

  //install husky & init husky
  spawn.sync("npx", ["husky", "install"], {
    stdio: "inherit",
  });

  // add pre-commit
  spawn.sync(
    "npx",
    [
      "husky",
      "add",
      PRE_COMMIT_PATH,
      `npx lint-staged --config ./.lintstagedrc.js`,
    ],
    {
      stdio: "inherit",
    }
  );

  Logger.info(chalk.yellow(`\n👏 husky 配置完成, please check for sure. \n`));
}

async function initLintstaged(
  projectType: string,
  supportTypeScript: boolean,
  pmTool: string
) {
  // install huksy
  for (const dep in lintstagedCiDeps) {
    installOraInstance.start(dep + "@" + huskyCiDeps[dep]);
    await installSaveDev(dep, huskyCiDeps[dep], pmTool);
    installOraInstance.succeed(dep + "@" + huskyCiDeps[dep]);
  }

  //init lint-staged config
  const suffix = ["js"];
  projectType === "vue" && suffix.push("vue");
  supportTypeScript && suffix.push("ts");
  const lintScript = suffix.length > 1 ? `{${suffix.join(",")}}` : suffix[0];
  const eslintPath = `**/*.${lintScript}`;

  const oldStagedConfig = getConfigPackage();

  const LINT_STAGED_CONFIGJSON = {
    ...oldStagedConfig,
    [eslintPath]: [
      "prettier   -c  --write  --config ./.prettierrc.js",
      "eslint  --config ./.eslintrc.js --fix",
    ],
  };

  fs.writeFileSync(
    LINT_STAGED_CONFIG_PATH,
    `module.exports = ${JSON.stringify(LINT_STAGED_CONFIGJSON, null, 2)}`
  );

  // 需要删除旧的lint-staged配置
  mdifyConfigPackage();

  Logger.info(
    chalk.green(
      `当前lint文件为"${LINT_STAGED_CONFIG_PATH}",可根据项目具体情况调整`
    )
  );

  Logger.info(
    chalk.yellow(`\n👏 lint-staged 配置完成, please check for sure. \n`)
  );
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
  pmTool: string = "yarn"
) {
  Logger.info(chalk.green("开始安装 git hook 配置..."));
  if (hookEngine === HookEngine["winfe"]) {
    Logger.info(
      chalk.yellow(
        `\n winfe hook has not yet been implemented ,please check for sure. \n`
      )
    );
  } else {
    await initHusky(pmTool);
    await initLintstaged(projectType, supportTypeScript, pmTool);
  }
}
