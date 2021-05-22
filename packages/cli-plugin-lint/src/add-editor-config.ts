/**
 * @author dashixiong
 * @description add .editorconfig
 */

import fs from "fs-extra";
import { resolve } from "path";
// import { runPrompts } from "./prompts";
import { Logger } from "./logger";
import chalk from "chalk";

const addVSCodeAutoFixOnSave = (vscodeObj: {}) => ({
  ...vscodeObj,
  "editor.codeActionsOnSave": {
    ...vscodeObj["editor.codeActionsOnSave"],
    "source.fixAll.eslint": true,
  },
});

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
            chalk.green(
              "Added VS Code settings in the current project for eslint to execute Prettier."
            )
          )
        )
        .catch((err: any) =>
          Logger.error("Could not write Prettier config to eslintrc.json", err)
        )
    )
    .catch(() => {
      Logger.info("No VS Code settings found. Creating new settings.");
      return fs.ensureFile(prettierDir).then(() =>
        fs
          .writeJson(
            prettierDir,
            {
              "eslint.autoFixOnSave": true,
            },
            {
              spaces: 2,
            }
          )
          .then(() =>
            Logger.info(
              chalk.green(
                "Created VS Code settings-file in the current project for eslint to execute Prettier."
              )
            )
          )
          .catch((err) => console.log(err))
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
      chalk.green("Created .editorconfig file in the current project .")
    );
  } catch (error) {
    Logger.error("No .editorconfig found. Creating new .editorconfig .");
    return fs.ensureFile(editorConfigDir).then(() =>
      fs
        .writeFile(editorConfigDir, editorConfigContent)
        .then(() =>
          Logger.info(
            chalk.green("Created .editorconfig file in the current project .")
          )
        )
        .catch((err) => Logger.error(err))
    );
  }
};

const configEditorrRC = async () => {
  /**
   * .editorconfig生成规则发生改变，.editorconfig和settings.json同时生成，不提供询问
   */
  // const { type } = await runPrompts<{ type: string }>({
  //   type: "select",
  //   name: "type",
  //   message: "For which editors do you want a configuration?",
  //   choices: [
  //     {
  //       message: "VS Code",
  //       name: "code",
  //     },
  //     {
  //       message: "EditorConfig",
  //       name: "editorConfig",
  //     },
  //   ],
  // });
  // switch (type) {
  //   case "code":
  //     await createVSCodeConfig();
  //     break;
  //   case "editorConfig":
  //     await createEditorConfig();
  //     break;
  //   default:
  //     break;
  // }
  await createVSCodeConfig();
  await createEditorConfig();
};
export default configEditorrRC;
