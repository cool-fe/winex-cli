/**
 * @author dashixiong
 * @description add prettier config in .prettier.js
 */

import fs from 'fs-extra';
import ora from 'ora';
import { resolve } from 'path';
import chalk from 'chalk';
import { prettierDeps } from './config';
import { getFilenameForDirectory, loadConfigFile, write } from './utils/config-file';
import { Logger } from './logger';
import { installSaveDev } from './utils/npm-utils';

const installOraInstance = ora('install-prettier');
const PRETTIER_CONFIG_PATH = resolve(__dirname, '../config/.prettierrc.js');

const addPrettierToExtends = (eslintObj: { extends: any }, prettierExtensionStr: string) => {
  if (eslintObj && eslintObj.extends && Array.isArray(eslintObj.extends)) {
    return [...eslintObj.extends, prettierExtensionStr];
  } else {
    return eslintObj.extends ? [eslintObj.extends, prettierExtensionStr] : prettierExtensionStr;
  }
};

const extendESLintConfig = (
  eslintObj: { extends: any; rules: any } = { extends: [], rules: {} }
) => ({
  ...eslintObj,
  extends: addPrettierToExtends(eslintObj, 'prettier')
});

const createPrettierrc = (prettier: string, dir: string = process.cwd()) => {
  const prettierDir = resolve(dir, './.prettierrc.js');
  return fs
    .ensureFile(prettierDir)
    .then(() =>
      fs
        .outputFile(prettierDir, prettier)
        .then(() =>
          Logger.info(chalk.yellow(`👏 Created .prettierrc.js, please check for sure \n`))
        )
        .catch((error) => {
          console.log(error);
        })
    )
    .catch((err: unknown) => console.log(err));
};

/**
 * add prettier config
 */

const configPrettierRC = async (pmTool?: string): Promise<void> => {
  try {
    Object.keys(prettierDeps).forEach(async (dep) => {
      installOraInstance.start(`安装 prettier\n${dep}@${prettierDeps[dep]}`);
      await installSaveDev(dep, prettierDeps[dep], pmTool);
      installOraInstance.clear();
    });
    installOraInstance.succeed('安装 prettier');
    const file = getFilenameForDirectory(process.cwd());
    const eslint = loadConfigFile({ filePath: file }) || {
      extends: [],
      rules: {}
    };
    if (file) write(extendESLintConfig(eslint), file);
    const prettierConfig = await fs.readFile(PRETTIER_CONFIG_PATH, {
      encoding: 'utf-8'
    });
    await createPrettierrc(prettierConfig);
  } catch (error) {
    Logger.error(chalk.red(`${error}`));
    process.exit(0);
  }
};
export default configPrettierRC;
