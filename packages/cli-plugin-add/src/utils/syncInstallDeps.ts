import chalk from 'chalk';
import { PkgOptions, CommonParams } from '../interface/index';
import { getPackageJson } from './getPackageJson';
import { warn } from './logger';
import { installDeps } from '../prompts';

const semver = require('semver');

function checkPkg({ local, remote }: PkgOptions): string {
  let type = 'none';
  if (remote !== local) {
    const localMajor = semver.major(local);
    const remoteMajor = semver.major(remote);
    if (localMajor !== remoteMajor) {
      return 'disabled'; // major version
    }

    const isNewer = semver.gt(remote, local);
    if (isNewer) return 'update';
  }
  return type;
}

function getresolvedDeps(remoteDeps: CommonParams, localDeps: string[]) {
  let resolvedDeps: string[] = []; // to update dependencies
  let disabledDeps: string[] = []; // incompatible API updates

  for (const key in remoteDeps) {
    const remote = semver.clean(remoteDeps[key]); // 提取版本号

    if (Object.prototype.hasOwnProperty.call(localDeps, key)) { // compare version
      const local = semver.clean(localDeps[key]);
      const res = checkPkg({ local, remote });
      switch (res) {
        case 'update':
          resolvedDeps.push(`${key}@${remoteDeps[key]}`);
          break
        case 'disabled':
          disabledDeps.push(`${key}: ${localDeps[key]} => ${remoteDeps[key]}`);
          break
        default:
          break
      }
    } else {
      resolvedDeps.push(`${key}@${remoteDeps[key]}`);
    }
  }

  return {
    resolvedDeps,
    disabledDeps,
  };
}

export async function syncInstallDeps(
  remoteDeps: CommonParams, context: string
): Promise<string[]> {
  const pkg = await getPackageJson(context); // local package.json
  const localDeps = pkg.dependencies || {};

  const { resolvedDeps, disabledDeps } = getresolvedDeps(remoteDeps, localDeps);

  if (disabledDeps.length > 0) {
    warn(
      `These dependencies may be major version upgrades, carefully installed or updated:\n` +
      `${chalk.cyan(disabledDeps.join('\n'))}`
    );
  }

  if (resolvedDeps.length <= 0) return [];

  const install = await installDeps(resolvedDeps);
  if (install) {
    return resolvedDeps;
  } else {
    return [];
  }
};
