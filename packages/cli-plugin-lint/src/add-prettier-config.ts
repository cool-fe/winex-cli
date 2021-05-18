import { runPrompts } from "./prompts";
import fs from "fs-extra";
import defaults from "../config/prettier.config";
import configFile from "./utils/config-file";

const mainOptions = [
  {
    type: "list",
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
  return Array.isArray(eslintObj.extends)
    ? [...eslintObj.extends, prettierExtensionStr]
    : eslintObj.extends
    ? [eslintObj.extends, prettierExtensionStr]
    : prettierExtensionStr;
};

const addPrettierToRules = (prettierObj: any, eslintObj: { rules: any }) => ({
  ...eslintObj.rules,
  "prettier/prettier": prettierObj ? ["error", prettierObj] : "error",
});

const extendESLintConfig = (eslintObj: Object, prettierObj: any) =>
  prettierObj
    ? {
        ...eslintObj,
        extends: addPrettierToExtends(eslintObj, "plugin:prettier/recommended"),
        rules: addPrettierToRules(prettierObj, eslintObj),
      }
    : { ...eslintObj, extends: addPrettierToExtends(eslintObj, "prettier") };

const prettierQuestions = () =>
  runPrompts(mainOptions)
    .then(({ type, run }) => ({ defaults, run }))
    .catch((error) => console.error(error));

const createPrettierrc = (prettier: any) => {
  return fs
    .ensureFile("./.prettierrc")
    .then(() => {
      fs.writeJson("./.prettierrc", prettier, {
        spaces: 2,
      }).then(() => console.log("Created .prettierrc."));
    })
    .catch((err: any) => console.log(err));
};

const configPrettierRC = async () => {
  const { prettier, run } = await prettierQuestions();
  console.log(`Adding prettier config.`);

  const file = configFile.getFilenameForDirectory(process.cwd());
  const eslint = configFile.loadConfigFile({ filePath: file });

  configFile.write(
    extendESLintConfig(eslint, run === "eslint" ? prettier : null),
    file
  );

  if (run === "prettier") {
    await createPrettierrc(prettier);
  }
};
export default configPrettierRC;
