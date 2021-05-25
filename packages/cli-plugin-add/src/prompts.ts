import { emoji } from './emoji';
import chalk from 'chalk';

const { prompt, Input } = require('enquirer');

const prefix = (state: any) => emoji[state.status];

export async function inputLocationDirectory(): Promise<string> {
  const _prompt = new Input({
    name: 'target',
    message: ` Please enter the location directory of the block`,
    default: './',
    prefix,
  });
  return await _prompt.run();
}

export async function isOverwriteIfblockExisted(_materialPath: string): Promise<boolean> {
  const { overwrite } = await prompt({
    type: "confirm",
    message: chalk.bold(` Target directory ${chalk.cyan(_materialPath)} already exists, Overwrite the file?`),
    name: "overwrite",
    prefix,
  });
  return overwrite;
}

export async function installDeps(resolvedDeps: string[]) {
  const { install } = await prompt({
    type: "confirm",
    message: chalk.bold(` Do you install the following other dependencies: ${chalk.cyan(resolvedDeps.join(' '))}`),
    name: "install",
    prefix,
  });
  return install;
}
