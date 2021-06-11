/**
 * @author dashixiong
 * @description integrate eslint into ci flow, provide husky & yorkie & winfe solutions
 */

import fs from 'fs';
import spawn from 'cross-spawn';
import { resolve } from 'path';
import chalk from 'chalk';
import * as _ from 'lodash';
import ora from 'ora';
import fileUtil from './utils/file';
import { Logger } from './logger';
import { HookEngine } from './index';
import { huskyCiDeps, lintstagedCiDeps } from './config';
import { installSaveDev } from './utils/npm-utils';

const LINT_STAGED_CONFIG_NAME = '.lintstagedrc.js';
const LINT_STAGED_CONFIG_PATH = resolve(process.cwd(), LINT_STAGED_CONFIG_NAME);

const installOraInstance = ora('install');

/**
 * 配置 package.json
 * @param eslintPath eslint检查路径
 */
function mdifyConfigPackage() {
  const packagePath = `${process.cwd()}/package.json`;
  const packageExist = fileUtil.checkExist(packagePath, false);
  if (packageExist) {
    // 如果package.json存在，进行修改
    const fileContent = fs.readFileSync(packagePath, 'utf-8');
    const fileJSON = JSON.parse(fileContent);
    // // 增加 precommit hook
    // fileJSON.scripts = _.assign(fileJSON.scripts || {}, {
    //   precommit: "lint-staged",
    // });
    // 配置 lint-staged
    // fileJSON["lint-staged"] = {
    //   [eslintPath]: "eslint",
    // };

    if (fileJSON['lint-staged']) {
      delete fileJSON['lint-staged'];
    }

    const fileNewContent = JSON.stringify(fileJSON, null, 2);
    // 写入
    fs.writeFileSync(packagePath, fileNewContent);
  } else {
    // 如果 package.json 不存在，初始化失败，提示用户进行 npm 初始化
    Logger.error(chalk.red('ERROR: 未找到package.json文件，请使用 npm init 进行初始化'));
    throw new Error('package.json not found');
  }
}

function getConfigPackage() {
  const packagePath = `${process.cwd()}/package.json`;
  const packageExist = fileUtil.checkExist(packagePath, false);
  if (packageExist) {
    // 如果package.json存在，进行修改
    const fileContent = fs.readFileSync(packagePath, 'utf-8');
    const fileJSON = JSON.parse(fileContent);

    if (fileJSON['lint-staged']) {
      return fileJSON['lint-staged'];
    }
    return {};
  } else {
    // 如果 package.json 不存在，初始化失败，提示用户进行 npm 初始化
    Logger.info(chalk.green('未找到package.json文件，请使用 yarn init 进行初始化'));
  }
  return null;
}

async function initHusky(pmTool: string) {
  const HUSKY_CONFIG_PATH = resolve(process.cwd(), './.husky');
  const PRE_COMMIT_PATH = `${HUSKY_CONFIG_PATH}/pre-commit`;

  // install huksy
  Object.keys(huskyCiDeps).forEach(async (dep) => {
    installOraInstance.start(`安装 husky 依赖\n${dep}@${huskyCiDeps[dep]}`);
    await installSaveDev(dep, huskyCiDeps[dep], pmTool);
    installOraInstance.clear();
  });

  installOraInstance.succeed('安装 husky');

  fs.rmdirSync(HUSKY_CONFIG_PATH, { recursive: true });

  if (spawn.sync('git', ['rev-parse']).status !== 0) {
    Logger.error(chalk.red('not a Git repository, skipping hooks installation'));
    Logger.info(chalk.yellow(`❗Warning! husky 配置失败, please check and try later. \n`));
    return;
  }
  //install husky & init husky
  const spawnHinstall = spawn.sync('npx', ['husky', 'install'], {
    stdio: ['inherit', 'inherit', 'pipe'],
    encoding: 'utf-8'
  });

  if (spawnHinstall.status !== 0) {
    throw new Error(`husky 初始化失败 \n ${spawnHinstall.stderr}`);
  }

  // add pre-commit
  const spawnHadd = spawn.sync(
    'npx',
    ['husky', 'add', PRE_COMMIT_PATH, `npx lint-staged --config ./.lintstagedrc.js`],
    {
      stdio: ['inherit', 'inherit', 'pipe'],
      encoding: 'utf-8'
    }
  );
  if (spawnHadd.status !== 0) {
    throw new Error(`husky add pre-commit hook failed \n ${spawnHadd.stderr}`);
  }

  Logger.info(chalk.yellow(`\n👏 husky 配置完成, please check for sure. \n`));
}

async function initLintstaged(projectType: string, supportTypeScript: boolean, pmTool: string) {
  // install huksy
  Object.keys(lintstagedCiDeps).forEach(async (dep) => {
    installOraInstance.start(`${dep}@${lintstagedCiDeps[dep]}`);
    await installSaveDev(dep, lintstagedCiDeps[dep], pmTool);
    installOraInstance.clear();
  });

  //init lint-staged config
  const suffix = ['js'];
  if (projectType === 'browser') suffix.push('vue');
  if (supportTypeScript) suffix.push('ts');
  const lintScript = suffix.length > 1 ? `{${suffix.join(',')}}` : suffix[0];
  const eslintPath = `**/*.${lintScript}`;

  const oldStagedConfig = getConfigPackage();

  const LINT_STAGED_CONFIGJSON = {
    ...oldStagedConfig,
    [eslintPath]: [
      'prettier   -c  --write  --config ./.prettierrc.js',
      'eslint  --config  ./.eslintrc.js --fix'
    ]
  };

  fs.writeFileSync(
    LINT_STAGED_CONFIG_PATH,
    `module.exports = ${JSON.stringify(LINT_STAGED_CONFIGJSON, null, 2)}`
  );

  // 需要删除旧的lint-staged配置
  mdifyConfigPackage();

  Logger.info(chalk.green(`当前lint文件为"${LINT_STAGED_CONFIG_NAME}",可根据项目具体情况调整`));

  Logger.info(chalk.yellow(`\n👏 lint-staged 配置完成, please check for sure. \n`));
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
  pmTool = 'yarn'
): Promise<void> {
  Logger.info(chalk.green('配置 git hook'));
  if (hookEngine === HookEngine.winfe) {
    Logger.info(
      chalk.yellow(`\n winfe hook has not yet been implemented ,please check for sure. \n`)
    );
  } else {
    try {
      await initHusky(pmTool);
      await initLintstaged(projectType, supportTypeScript, pmTool);
    } catch (error) {
      Logger.error(chalk.red(`${error}`));
      process.exit(0);
    }
  }
}
