/**
 * @author dashixiong
 * @description add .editorconfig
 */

import fs from "fs-extra";
import { resolve } from "path";
import { Logger } from "./logger";
import chalk from "chalk";

const DEFAULT_VSCODE_SETTING = {
  "editor.codeActionsOnSave": {
    "source.fixAll": true,
    "source.fixAll.eslint": true,
  },
  "editor.formatOnSave": true,
  "editor.formatOnSaveMode": "modifications",
  "eslint.codeActionsOnSave.mode": "all",
  "eslint.run": "onType",
  "prettier.vueIndentScriptAndStyle": false,
};

const addVSCodeAutoFixOnSave = (vscodeObj: {}) => {
  // The setting is deprecated. Use editor.codeActionsOnSave instead with a source.fixAll.eslint member.(2)
  if (vscodeObj["eslint.autoFixOnSave"]) {
    delete vscodeObj["eslint.autoFixOnSave"];
  }

  return {
    ...(vscodeObj || {}),
    ...DEFAULT_VSCODE_SETTING,
    "editor.codeActionsOnSave": {
      ...(vscodeObj["editor.codeActionsOnSave"] || {}),
      "source.fixAll": true,
      "source.fixAll.eslint": true,
    },
  };
};

const createVSCodeConfig = (dir: string = process.cwd()) => {
  const prettierDir = resolve(dir, "./.vscode/settings.json");
  return fs
    .readJson(prettierDir)
    .then((vsCodeObj: {}) =>
      fs
        .writeJson(prettierDir, addVSCodeAutoFixOnSave(vsCodeObj), {
          spaces: 2,
        })
        .then(() =>
          Logger.info(
            chalk.yellow(
              `\n👏 Added VS Code settings in the current project for eslint to execute Prettier, please check for sure. `
            )
          )
        )
    )
    .catch(() => {
      Logger.info("No VS Code settings found. Creating new settings.");
      return fs.ensureFile(prettierDir).then(() =>
        fs
          .writeJson(prettierDir, DEFAULT_VSCODE_SETTING, {
            spaces: 2,
          })
          .then(() =>
            Logger.info(
              chalk.yellow(
                "\n👏 Created VS Code settings-file in the current project for eslint to execute Prettier. "
              )
            )
          )
          .catch((err) =>
            Logger.error(
              chalk.red(
                `"Could not write Prettier config to eslintrc.json"\n${err}`
              )
            )
          )
      );
    });
};

const createEditorConfig = async (dir: string = process.cwd()) => {
  const defaultEditorConfigPath = resolve(__dirname, "../config/.editorconfig");
  const editorConfigDir = resolve(dir, "./.editorconfig");
  const editorConfigContent = await fs.readFile(defaultEditorConfigPath);
  try {
    await fs.writeFile(editorConfigDir, editorConfigContent);
    Logger.info(
      chalk.yellow(
        `\n👏 Created .editorconfig file in the current project, please check for sure .\n`
      )
    );
  } catch (error) {
    Logger.error(`No .editorconfig found. Creating new .editorconfig .`);
    return fs.ensureFile(editorConfigDir).then(() =>
      fs
        .writeFile(editorConfigDir, editorConfigContent)
        .then(() =>
          Logger.info(
            chalk.yellow(
              `\n👏 Created .editorconfig file in the current project, please check for sure .\n`
            )
          )
        )
        .catch((err) => Logger.error(chalk.red(`Could not Created .editorconfig file.\n${err}`)))
    );
  }
};

const configEditorrRC = async () => {
  /**
   * .editorconfig生成规则发生改变，.editorconfig和settings.json同时生成，不提供询问
   */
  await createVSCodeConfig();
  await createEditorConfig();
};
export default configEditorrRC;
