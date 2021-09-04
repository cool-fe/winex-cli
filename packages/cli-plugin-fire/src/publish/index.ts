/* eslint-disable node/no-missing-require */
/* eslint-disable no-restricted-syntax */
/* eslint-disable complexity */
import execa from 'execa';
import chalk from 'chalk';
import { join } from 'path';
import standardVersion from 'standard-version';
//@ts-ignore
import { npmPublish } from '@lerna/npm-publish';
//@ts-ignore
import npmConf from '@lerna/npm-conf';
import crypto from 'crypto';
//@ts-ignore
import Package from '@lerna/package';
//@ts-ignore
import getRepoInfo from 'git-repo-info';
import packDirectory from './pack-directory';
import exec from '../utils/exec';
import { runPrompts } from '../utils/prompts';
import uploadMaterialDatas from './upload-minio';
import { printErrorAndExit, logStep } from '../utils/print';
import materialProject from './material';

const lazy = Package.Package.lazy;
const REGISTRY = 'http://172.16.9.242:8081/repository/winfe-material/';
const NEXUS_AUTHTOKEN = 'NpmToken.117fb104-1494-35fb-9971-1af5cad0a92a';
const REGISTRY_URI = REGISTRY.slice(5);

function userAgent() {
  // consumed by npm-registry-fetch (via libnpmpublish)
  return `lerna/4.0.0/node@${process.version}+${process.arch} (${process.platform})`;
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

// eslint-disable-next-line consistent-return
export default async function release(cwd = process.cwd(), args: any): Promise<void> {
  // Check git status
  if (!args.skipGitStatusCheck && !args.publishOnly) {
    const gitStatus = execa.sync('git', ['status', '--porcelain']).stdout;
    if (gitStatus.length) {
      printErrorAndExit(`Your git status is not clean. Aborting.`);
    }
  } else {
    logStep('git status check is skipped, since --skip-git-status-check is supplied');
  }

  const npmSession = crypto.randomBytes(8).toString('hex');

  // Check npm registry
  logStep('check npm registry');
  const registry: string = args.registry || REGISTRY;
  if (registry !== REGISTRY) {
    const registryChalk = chalk.blue(REGISTRY);
    printErrorAndExit(`Release failed, npm registry must be ${registryChalk}.`);
  }

  const conf = npmConf({
    lernaCommand: 'publish',
    npmSession: args.npmSession || npmSession,
    npmVersion: args.userAgent || userAgent(),
    registry,
    [`${REGISTRY_URI}:_authToken`]: NEXUS_AUTHTOKEN
  });

  let updated = null;

  if (!args.publishOnly) {
    // Get updated packages
    logStep('check updated packages');

    let updatedStdout;
    if (args.mode === 'lerna') {
      //TODO lerna类似的文件结构后续支持
      updatedStdout = [];
    } else {
      updatedStdout = args.package ? args.package : [lazy(join(cwd, 'package.json'))];
    }

    updated = updatedStdout;

    if (!updated.length) {
      printErrorAndExit('Release failed, no updated package is updated.');
    }

    // Clean
    logStep('clean');

    logStep('bump version with standard-version version');

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [_, pack] of updated.entries()) {
      const versionCliArgs: standardVersion.Options = {
        skip: {
          // commit: true,
          // tag: true
        }
      };
      const isRelease = args.release;
      const isBeta = args.beta;

      if (!isRelease && !isBeta)
        printErrorAndExit('Release failed, no --beta or --release  param.');
      if (isRelease && isBeta)
        printErrorAndExit('Release failed, there can only be one --beta and --release.');

      versionCliArgs.tagPrefix = `${pack.name}@`;

      if (isRelease) {
        const relaseConfirm: { release: boolean } = await runPrompts({
          type: 'confirm',
          name: 'release',
          message: `Does your release from ${pack.version} to release ${isRelease}? `,
          initial: false
        });
        if (!relaseConfirm.release) printErrorAndExit('Release cancel');
        versionCliArgs.releaseAs = isRelease;
      } else if (isBeta) {
        if (['patch', 'minor', 'major'].includes(isBeta)) {
          versionCliArgs.releaseAs = isBeta;
          versionCliArgs.prerelease = 'beta';
        }
      }
      await standardVersion(versionCliArgs);
    }
  }

  try {
    // Publish
    // eslint-disable-next-line no-nested-ternary
    const releasePkgs = args.publishOnly
      ? args.package
        ? args.package
        : [lazy(join(cwd, 'package.json'))]
      : updated;

    logStep(`publish packages: ${chalk.blue(releasePkgs.map((pck: any) => `${pck.name},`))}`);

    for (const [index, pkg] of releasePkgs.entries()) {
      // Build
      if (!args.skipBuild) {
        logStep(`build: ${pkg.name}`);
        process.env.APP_ROOT = pkg.rootPath;
        process.env.APP_TYPE = 'material';
        const vmiCli = require.resolve('@winfe/vmi/bin/vmi');
        await exec(vmiCli, ['build', ...process.argv.slice(3)]);
      } else {
        logStep('build is skipped, since args.skipBuild is supplied');
      }

      await pkg.refresh();

      console.log(
        `[${index + 1}/${releasePkgs.length}] Publish package ${pkg.name} ${pkg.version}`
      );

      pkg.packed = await packDirectory(pkg, pkg.location, args);
      // const tag = execa.sync('git', ['describe', '--abbrev=0', '--tags']).stdout;
      const opts = Object.assign(conf.snapshot, {
        // distTag defaults to "latest" OR whatever is in pkg.publishConfig.tag
        // if we skip temp tags we should tag with the proper value immediately
        // if no pkg.publishConfig.tag default tag is latest
        tag: pkg?.publishConfig?.tag
          ? pkg.publishConfig.tag
          : conf.get('tag') === 'latest' && (args.release ? 'latest' : 'latest')
      });

      const pkgOpts = {
        ...args,
        ...opts
      };

      await npmPublish(pkg, pkg.packed.tarFilePath, pkgOpts);

      logStep(`dist-tag ${pkg.name}@${pkg.version} => ${opts.tag}`);

      // update tag
      // const spec = `${pkg.name}@${pkg.version}`;
      // const preDistTag = 'beta';
      // const distTag = preDistTag || 'latest';
      // await npmDistTag.add(spec, distTag, pkgOpts);
      // logStep(`dist-tag ${pkg.name}@${pkg.versio} => ${distTag}`);
    }

    logStep(`generate material`);
    const materialP = materialProject(cwd);
    if (!materialP || !materialP.rootPath) {
      return printErrorAndExit(
        'your project not material repository or package.json no materialConfig config'
      );
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      await require('iceworks/lib/command/generate').default({
        rootDir: materialP?.rootPath
      });
    } catch (err) {
      return printErrorAndExit(`iceworks generate error\n${err.message}`);
    }

    await uploadMaterialDatas(materialP?.rootPath);

    // Push all
    logStep(`git push`);
    const { branch } = getRepoInfo();
    await exec('git', ['push', 'origin', branch, '--tags']);
    logStep('done');
  } catch (error) {
    if (!args.publishOnly) {
      await exec('git', ['reset', '--mixed', 'HEAD^']);
    }
    logStep('fail');
  }
}
