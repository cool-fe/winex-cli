/* eslint-disable no-restricted-syntax */
/* eslint-disable complexity */
import execa from 'execa';
import chalk from 'chalk';
import { join } from 'path';
import { writeFileSync } from 'fs';
import getRepoInfo from 'git-repo-info';
import pReduce from 'p-reduce';
import semver from 'semver';
import Version from '@lerna/version';
import exec from '../utils/exec';
import isNextVersion from '../utils/isNextVersion';
import { getChangelog } from '../utils/changelog';

// eslint-disable-next-line node/no-extraneous-require
const lernaCli = require.resolve('lerna/cli');

function isBreakingChange(currentVersion: string, nextVersion: string) {
  const releaseType = semver.diff(currentVersion, nextVersion);
  let breaking;

  if (releaseType === 'major') {
    // self-evidently
    breaking = true;
  } else if (releaseType === 'minor') {
    // 0.1.9 => 0.2.0 is breaking
    breaking = semver.lt(currentVersion, '1.0.0');
  } else if (releaseType === 'patch') {
    // 0.0.1 => 0.0.2 is breaking(?)
    breaking = semver.lt(currentVersion, '0.1.0');
  } else {
    // versions are equal, or any prerelease
    breaking = false;
  }

  return breaking;
}

function printErrorAndExit(message: string) {
  console.error(chalk.red(message));
  process.exit(1);
}

function logStep(name: string) {
  console.log(`${chalk.gray('>> Release:')} ${chalk.magenta.bold(name)}`);
}

/**
 * pulish 发布流程
 *
 * 1、校验本地git status状态，如果是skip ｜ publishOnly 则跳过检测，否则本地改动都要commit
 * 2、分lerna还是normal模式获取要发布的包
 *    1、如果是normal则获取--package ｜ 当前process.cwd
 *    2、如果是lerna则按照lerna的方式获取更新包
 *    3、还有一种情况就是虽然--mode=lerna，但是获取lerna出现错误，则降级为normal
 *
 * 2、遍历需要发布的包一次进行发布
 *    1、是否仅仅是发布，而不是要
 *    2、Check npm registry
 *
 */

export default async function release(cwd = process.cwd(), args: any) {
  // Check git status
  if (!args.skipGitStatusCheck && !args.publishOnly) {
    const gitStatus = execa.sync('git', ['status', '--porcelain']).stdout;
    if (gitStatus.length) {
      printErrorAndExit(`Your git status is not clean. Aborting.`);
    }
  } else {
    logStep('git status check is skipped, since --skip-git-status-check is supplied');
  }

  // get release notes
  let releaseNotes;

  if (!args.publishOnly) {
    logStep('get release notes');
    // releaseNotes = await getChangelog();
    // console.log(releaseNotes(''));
  }

  // Check npm registry
  logStep('check npm registry');
  const userRegistry = execa.sync('npm', ['config', 'get', 'registry']).stdout;
  if (userRegistry.includes('https://registry.yarnpkg.com/')) {
    printErrorAndExit(`Release failed, please use ${chalk.blue('npm run release')}.`);
  }
  if (!userRegistry.includes('https://registry.npmjs.org/')) {
    const registry = chalk.blue('https://registry.npmjs.org/');
    printErrorAndExit(`Release failed, npm registry must be ${registry}.`);
  }

  let updated = null;

  if (!args.publishOnly) {
    // Get updated packages
    logStep('check updated packages');
    let updatedStdout;

    if (args.mode === 'lerna') updatedStdout = execa.sync(lernaCli, ['changed']).stdout;
    else {
      updatedStdout = args.package ? args.package : './';
    }

    updated = updatedStdout
      .split(/[\n|,]/)
      .map((pkg: string) => pkg.split('/')[1])
      .filter(Boolean);
    if (!updated.length) {
      printErrorAndExit('Release failed, no updated package is updated.');
    }

    // Clean
    logStep('clean');

    // Build
    if (!args.skipBuild) {
      logStep('build');
      // await exec('npm', ['run', 'build']);
    } else {
      logStep('build is skipped, since args.skipBuild is supplied');
    }

    if (args.mode === 'lerna') {
      // Bump version
      logStep('bump version with lerna version');

      const verInstance = Version(args);

      const result = await Promise.resolve()

        .then(() => verInstance.configureEnvironment())
        .then(() => verInstance.configureOptions())
        .then(() => verInstance.configureProperties())
        .then(() => verInstance.configureLogging())
        .then(() => verInstance.runPreparations())
        .then(() => verInstance.initialize())
        // eslint-disable-next-line consistent-return
        .then((proceed) => {
          if (proceed !== false) {
            return verInstance.execute();
          }
          // early exits set their own exitCode (if non-zero)
        });
      process.exit();
    } else {
      // 单个包更新版本
      const resolvePrereleaseId = args.preid || 'alpha';
      const getVersion = (node) => execa.sync('npm', ['version', 'resolvePrereleaseId']).stdout;

      const iterator = (versionMap: Map<any, any>, node: any) =>
        Promise.resolve(getVersion(node)).then((version) => versionMap.set(node.name, version));

      const verMap = pReduce(updated, iterator, new Map());

      const packageGraph = function packageGraph(name: string) {
        // eslint-disable-next-line import/no-dynamic-require
        return require(`${name}/package.json`);
      };

      let hasBreakingChange;

      for (const [name, bump] of verMap) {
        hasBreakingChange = hasBreakingChange || isBreakingChange(packageGraph(name).version, bump);
      }

      if (hasBreakingChange) {
        // _all_ packages need a major version bump whenever _any_ package does
        updated = Array.from(this.packageGraph.values());

        // --no-private completely removes private packages from consideration
        if (this.options.private === false) {
          // TODO: (major) make --no-private the default
          updated = updated.filter((node) => !node.pkg.private);
        }

        this.updatesVersions = new Map(updated.map((node) => [node.name, this.globalVersion]));
      } else {
        this.updatesVersions = versions;
      }
    }
  }

  // Publish
  const releasePkgs = updated;
  logStep(`publish packages: ${chalk.blue(releasePkgs.join(', '))}`);

  const currVersion = require('../lerna').version;
  const isNext = isNextVersion(currVersion);

  for (const [index, pkg] of releasePkgs.entries()) {
    const pkgPath = join(cwd, 'packages', pkg);
    const { name, version } = require(join(pkgPath, 'package.json'));
    if (version === currVersion) {
      console.log(
        `[${index + 1}/${releasePkgs.length}] Publish package ${name} ${
          isNext ? 'with next tag' : ''
        }`
      );
      const cliArgs = isNext ? ['publish', '--tag', 'next'] : ['publish'];

      const { stdout } = execa.sync('npm', cliArgs, {
        cwd: pkgPath
      });
      console.log(stdout);
    }
  }

  logStep('create github release');
  const tag = `v${currVersion}`;

  const changelog = releaseNotes ? releaseNotes(tag) : '';
  console.log(changelog);

  logStep('done');
}
