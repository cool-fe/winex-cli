import chalk from 'chalk';
import { emoji } from '../emoji';
import { PkgOptions, CommonParams } from '../interface';
import { getPackageJson } from './getPackageJson';
import { warn } from './logger';

const semver = require('semver');
const { prompt } = require('enquirer');

const VERSION_RE = /^\^/;

function checkUpdateAsync({ local, remote }: PkgOptions): Promise<string> {
  return new Promise((resolve) => {
    if (remote !== local) {
      const localMajor = semver.major(local);
      const remoteMajor = semver.major(remote);
      if (localMajor !== remoteMajor) resolve('disabled'); // major version

      const isNewer = semver.gt(remote, local);
      if (isNewer) resolve('update');
    } else {
      resolve('none');
    }
  })
}

export async function syncInstallDeps(
  remoteDeps: CommonParams, context: string
): Promise<string[] | undefined> {
  // remote dependencies
  if (Object.keys(remoteDeps).length <= 0) return;

  let resolvedDeps = []; // to update dependencies
  let disabledDeps = []; // incompatible API updates

  // local package.json
  const pkg = await getPackageJson(context);

  const localDeps = !pkg.dependencies ? {} : pkg.dependencies;

  for (const key in remoteDeps) {
    const remote = remoteDeps[key].replace(VERSION_RE, '');

    if (Object.prototype.hasOwnProperty.call(localDeps, key)) { // compare version
      const local = localDeps[key].replace(VERSION_RE, '');
      const res = await checkUpdateAsync({ local, remote });
      switch (res) {
        case 'update':
          resolvedDeps.push(`${key}@${remote}`);
          break
        case 'disabled':
          disabledDeps.push(`${key}: ${local} => ${remote}`);
          break
        default:
          break
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
