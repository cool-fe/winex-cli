import chalk from 'chalk';
import fs from 'fs-extra';
import ora from 'ora';
import path from 'path';
import {
  inputLocationDirectory,
  isOverwriteIfblockExisted,
} from '../prompts';

const downloadPkgTarball = require('download-package-tarball');

class FolderNotFoundError extends Error {
  constructor(_filePath: string) {
    super(
      `Folder ${chalk.cyan(
        _filePath
      )} could not be found`
    );
    this.name = 'FolderNotFoundError';
  }
}

/**
 * check folder
 */
async function checkFolder(
  context: string
): Promise<string> {
  const _target = await inputLocationDirectory(); // enter the directory

  const _filePath = path.join(context, _target); // target directory

  if (!fs.existsSync(_filePath)) { // The folder does not exist
    throw new FolderNotFoundError(_filePath);
  }

  return _filePath;
}

/**
 * get folder path
 */
async function getFilePath(
  pluginName: string, context: string,
): Promise<string> {
  const _filePath = await checkFolder(context);

  let _materialPath = path.join(_filePath, pluginName);

  // The block existed
  if (fs.existsSync(_materialPath)) {
    const overwrite = await isOverwriteIfblockExisted(_materialPath);

    if (overwrite) {
      fs.removeSync(path.resolve(_filePath, pluginName)); // remove
    } else {
      process.exit(1);
    }
  }

  return _filePath;
}

/**
 * @param {String} pluginName -- full name of the package to get
 * @param {String} tarball -- the url of dist tgz
 * @param {String} core
 *
 * Download package and remove redundant files
 */
export async function downloadPackage(
  pluginName: string, tarball: string, context: string
): Promise<string> {
  const [_scope, name] = pluginName.split('/'); // scope

  const _filePath = await getFilePath(name, context);

  const spinner = ora(chalk.bold(` Downloading ${chalk.cyan(pluginName)}...`));
  const process = spinner.start();

  try {
    await downloadPkgTarball({ url: tarball, dir: _filePath });
  } catch (error) {
    throw error;
  }

  // installed packages have a lot of files we don't care about, just remove files
  const _resultPath = path.resolve(_filePath, name);

  fs.moveSync(
    path.resolve(_filePath, _scope, name),
    _resultPath,
    { overwrite: true }
  );

  fs.removeSync(path.resolve(_filePath, _scope));

  process.succeed();

  return _resultPath;
};
