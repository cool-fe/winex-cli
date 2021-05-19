import { AddOptions } from '../interface';
import chalk from 'chalk';
import { emoji } from '../emoji';

const ora = require('ora');
const fs = require('fs');
const fsExtra = require('fs-extra');
const path = require('path');
const { prompt, Input } = require('enquirer');
const downloadPkgTarball = require('download-package-tarball');

class FolderNotFoundError extends Error {
  constructor(_filePath: string) {
    super(`Folder ${chalk.cyan(_filePath)} could not be found`);
    this.name = 'FolderNotFoundError';
  }
}

async function checkFile({ pluginName, context }: AddOptions): Promise<string | undefined> {
  const input = new Input({
    name: 'target',
    message: ` Please enter the location directory of the block`,
    default: './',
    prefix: (state: any) => emoji[state.status],
  });
  const target = await input.run();

  const _filePath = path.join(context, target); // target directory

  if (!fs.existsSync(_filePath)) { // The folder does not exist
    throw new FolderNotFoundError(_filePath);
  }

  let _materialPath = path.join(_filePath, pluginName);
  if (!fs.existsSync(_materialPath)) { // The block does not exist
    return _filePath;
  }

  // block existed
  const { overwrite } = await prompt({
    type: "confirm",
    message: chalk.bold(` Target directory ${chalk.cyan(_materialPath)} already exists, Overwrite the file?`),
    name: "overwrite",
    prefix: (state: any) => emoji[state.status],
  });
  if (overwrite) return _filePath;
  return;
}

/**
 * @param {String} pluginName -- full name of the package to get
 * @param {String} tarball -- the url of dist tgz
 * @param {String} core
 *
 * Download package and remove redundant files
 */
module.exports = async function downloadPackage({ pluginName, tarball, context }: AddOptions): Promise<string | undefined> {
  const [_scope, name] = pluginName.split('/'); // scope
  pluginName = name; // component name

  const _filePath = await checkFile({ pluginName, context });

  if (_filePath) {
    const spinner = ora(chalk.bold(` Downloading ${chalk.cyan(pluginName)}...`));
    const process = spinner.start();

    return downloadPkgTarball({
      url: tarball,
      dir: _filePath,
    })
      .then(() => {
        // installed packages have a lot of files we don't care about, just remove files
        const _resultPath = path.resolve(_filePath, pluginName);
        fsExtra.moveSync(
          path.resolve(_filePath, _scope, pluginName),
          _resultPath,
          { overwrite: true }
        );
        fsExtra.removeSync(path.resolve(_filePath, _scope));

        process.succeed();

        return _resultPath;
      })
      .catch((err: Error) => {
        throw err;
      });
  }
  return;
};
