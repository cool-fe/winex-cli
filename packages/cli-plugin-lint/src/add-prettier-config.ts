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

const PRETTIER_CONFIG_PATH = resolve(__dirname, "../config/.prettierrc.js");

const addPrettierToExtends = (
  eslintObj: { extends: any },
  prettierExtensionStr: string
) => {
  if (eslintObj && eslintObj.extends && Array.isArray(eslintObj.extends)) {
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
  eslintObj: { extends: any; rules: any } = { extends: [], rules: {} }
) => ({
  ...eslintObj,
  extends: addPrettierToExtends(eslintObj, "prettier"),
});

const prettierQuestions = () =>
  runPrompts<{ run: string }>(mainOptions)
    .then(({ run }) => ({ run }))
    .catch((error) => console.error(error));

const createPrettierrc = (prettier: string, dir: string = process.cwd()) => {
  const prettierDir = resolve(dir, "./.prettierrc.js");
  return fs
    .ensureFile(prettierDir)
    .then(() => {
      return fs
        .outputFile(prettierDir, prettier)
        .then(() =>
          Logger.info(
            chalk.yellow(
              `\n👏 Created .prettierrc.js, please check for sure \n`
            )
          )
        )
        .catch((error) => {
          console.log(error);
        });
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
    Logger.info(chalk.green("Adding prettier config."));
    const file = getFilenameForDirectory(process.cwd());
    const eslint = loadConfigFile({ filePath: file }) || {
      extends: [],
      rules: {},
    };

    write(extendESLintConfig(eslint), file);

    if (run === "prettier") {
      const prettierConfig = await fs.readFile(PRETTIER_CONFIG_PATH, {
        encoding: "utf-8",
      });
      await createPrettierrc(prettierConfig);
    }
  } catch (error) {
    Logger.error(chalk.red(`${error}`));
    process.exit(0);
  }
};
export default configPrettierRC;
