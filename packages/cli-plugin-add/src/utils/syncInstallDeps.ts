import chalk from 'chalk';
import { PkgOptions, CommonParams } from '../interface/index';
import { getPackageJson } from './getPackageJson';
import { warn } from './logger';
import { installDeps } from '../prompts';

const semver = require('semver');

const VERSION_RE = /^\^/;

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
    const remote = remoteDeps[key].replace(VERSION_RE, '');

    if (Object.prototype.hasOwnProperty.call(localDeps, key)) { // compare version
      const local = localDeps[key].replace(VERSION_RE, '');
      const res = checkPkg({ local, remote });
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
