import { runPrompts } from "./prompts";
import fs from "fs-extra";
import chalk from "chalk";
import defaults from "../config/prettier.config";
import {
  getFilenameForDirectory,
  loadConfigFile,
  write,
} from "./utils/config-file";
import { Logger } from "./logger";

const mainOptions = [
  {
    type: "select",
    name: "run",
    message: "How should Prettier be run?",
    choices: [
      {
        name: "By the Prettier CLI/plugin",
        value: "prettier",
      },
      {
        name: "By ESLint",
        value: "eslint",
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

const createPrettierrc = (prettier: object) => {
  return fs
    .ensureFile("./.prettierrc")
    .then(() => {
      fs.writeJson("./.prettierrc", prettier, {
        spaces: 2,
      }).then(() => console.log("Created .prettierrc."));
    })
    .catch((err: any) => console.log(err));
};

/**
 * add prettier config
 */
const configPrettierRC = async () => {
  try {
    const answer = await prettierQuestions();
    if (answer) {
      const { run } = answer;
      Logger.info(chalk.green("Adding prettier config."));
      const file = getFilenameForDirectory(process.cwd());
      const eslint = loadConfigFile({ filePath: file });
      console.log(eslint);
      write(
        extendESLintConfig(eslint, run === "eslint" ? defaults : null),
        file
      );

      if (run === "prettier") {
        await createPrettierrc(defaults);
      }
    }
  } catch (error) {}
};
export default configPrettierRC;
