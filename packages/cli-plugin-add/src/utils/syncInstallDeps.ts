import chalk from 'chalk';
import { emoji } from '../emoji';
import { PkgOptions } from '../interface';

const semver = require('semver');
const { prompt } = require('enquirer');
const { warn } = require('./logger');
const { getPackageJson } = require('./getPackageJson');

const VERSION_RE = /^\^/;

async function checkUpdateAsync({ local, remote }: PkgOptions): Promise<boolean | undefined> {
  if (remote !== local) {
    const localMajor = semver.major(local);
    const remoteMajor = semver.major(remote);
    if (localMajor !== remoteMajor) return false; // major version

    const isNewer = semver.gt(remote, local);
    if (isNewer) return true;
  }

  return;
}

module.exports = async function syncInstallDeps(remoteDeps: object, context: string): Promise<string[] | undefined> {
  // remote dependencies
  if (Object.keys(remoteDeps).length <= 0) return;

  // local package.json
  const pkg = await getPackageJson(context);

  const localDeps = !pkg.dependencies ? {} : pkg.dependencies;

  let resolvedDeps = []; // to update dependencies
  let disabledDeps = []; // incompatible API updates

  for (const key in remoteDeps) {
    const remote = remoteDeps[key].replace(VERSION_RE, '');

    if (Object.prototype.hasOwnProperty.call(localDeps, key)) { // compare version
      const local = localDeps[key].replace(VERSION_RE, '');
      const res = await checkUpdateAsync({ local, remote });

      if (res === true) {
        resolvedDeps.push(`${key}@${remote}`);
      } else if (res === false) {
        disabledDeps.push(`${key}: ${local} => ${remote}`);
      }

    } else {
      resolvedDeps.push(`${key}@${remote}`);
    }
  }

  if (disabledDeps.length > 0) {
    warn(
      `These dependencies may be incompatible API updates, carefully installed or updated:\n` +
      `${chalk.cyan(disabledDeps.join('\n'))}`
    );
  }

  if (resolvedDeps.length <= 0) return;

  const { install } = await prompt({
    type: "confirm",
    message: chalk.bold(` Do you install the following other dependencies: ${chalk.cyan(resolvedDeps.join(' '))}`),
    name: "install",
    prefix: (state: any) => emoji[state.status],
  });
  if (install) return resolvedDeps;

  return;
};
