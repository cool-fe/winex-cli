/**
 * @author dashixiong
 * @description add prettier config in .prettier.js
 */

import { runPrompts } from "./prompts";
import fs from "fs-extra";
import ora from "ora";
import { resolve } from "path";
import { prettierDeps } from "./config";
import chalk from "chalk";
import defaults from "../config/prettier.config";
import {
  getFilenameForDirectory,
  loadConfigFile,
  write,
} from "./utils/config-file";
import { Logger } from "./logger";
import { installSaveDev } from "./utils/npm-utils";

const installOraInstance = ora("install-prettier");

const mainOptions = [
  {
    type: "select",
    name: "run",
    message: "How should Prettier be run?",
    choices: [
      {
        message: "By the Prettier CLI/plugin",
        name: "prettier",
      },
      {
        message: "By ESLint",
        name: "eslint",
      },
    ],
  },
];

const addPrettierToExtends = (
  eslintObj: { extends: any },
  prettierExtensionStr: string
) => {
  if (Array.isArray(eslintObj.extends)) {
    return [...eslintObj.extends, prettierExtensionStr];
  } else {
    return eslintObj.extends
      ? [eslintObj.extends, prettierExtensionStr]
      : prettierExtensionStr;
  }
};

const addPrettierToRules = (
  prettierObj: any,
  eslintObj: { rules: any; extends: any }
) => ({
  ...eslintObj.rules,
  "prettier/prettier": prettierObj ? ["error", prettierObj] : "error",
});

const extendESLintConfig = (
  eslintObj: { extends: any; rules: any },
  prettierObj: object | null
) =>
  prettierObj
    ? {
        ...eslintObj,
        extends: addPrettierToExtends(eslintObj, "plugin:prettier/recommended"),
        rules: addPrettierToRules(prettierObj, eslintObj),
      }
    : { ...eslintObj, extends: addPrettierToExtends(eslintObj, "prettier") };

const prettierQuestions = () =>
  runPrompts<{ run: string }>(mainOptions)
    .then(({ run }) => ({ run }))
    .catch((error) => console.error(error));

const createPrettierrc = (prettier: object, dir: string = process.cwd()) => {
  const prettierDir = resolve(dir, "./.prettierrc.js");
  return fs
    .ensureFile(prettierDir)
    .then(() => {
      fs.outputFile(
        prettierDir,
        `'use strict';\n\n module.exports = ${JSON.stringify(
          prettier,
          null,
          2
        )}`,
        {
          encoding: "utf8",
        }
      ).then(() =>
        Logger.info(
          chalk.yellow(`\n👏 Created .prettierrc.js, please check for sure \n`)
        )
      );
    })
    .catch((err: any) => console.log(err));
};

/**
 * add prettier config
 */

const configPrettierRC = async (pmTool?: string) => {
  try {
    Logger.info(chalk.green("安装prettier相关依赖"));
    for (const dep in prettierDeps) {
      installOraInstance.start(dep + "@" + prettierDeps[dep]);
      await installSaveDev(dep, prettierDeps[dep], pmTool);
      installOraInstance.succeed(dep + "@" + prettierDeps[dep]);
    }
    // const answer = await prettierQuestions();
    // if (answer) {
    // const { run } = answer;
    const run = "prettier"; // run prettier  By the Prettier CLI/plugin  default
    Logger.info(chalk.green("\n Adding prettier config."));
    const file = getFilenameForDirectory(process.cwd());
    const eslint = loadConfigFile({ filePath: file });

    // write(extendESLintConfig(eslint, run === "eslint" ? defaults : null), file);
    write(extendESLintConfig(eslint, null), file);

    if (run === "prettier") {
      await createPrettierrc(defaults);
    }
    // }
  } catch (error) {}
};
export default configPrettierRC;
