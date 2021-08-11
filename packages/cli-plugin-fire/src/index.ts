import { BasePlugin } from '@winfe/cli-core';
import chalk from 'chalk';
import log from 'npmlog';
// import os from 'os';
import Logger from './logger';
// import { collectMatiralUpdates } from './package';
import build from './build';
// import { runPrompts } from './prompts';
// import publish from './publish';

import App from './core/App';

// function output(...args: string[]) {
//   log.clearProgress();
//   console.log(...args);
//   log.showProgress();
// }

export type PluginOptions = {
  package: string;
  registry: boolean;
  ci?: boolean;
};

function createApp(
  options: { plugins?: any; theme?: any; temp?: string; sourceDir: string } | undefined
) {
  Logger.info('Extracting site metadata...');
  // @ts-ignore
  return new App(options);
}

async function runStart() {
  const app = createApp({
    sourceDir: process.cwd()
  });
  await app.process();
  await app.dev();
}

export default class LintPlugin extends BasePlugin {
  commands = {
    build: {
      describe: 'publish a material package',
      lifecycleEvents: ['build', 'file', 'publish', 'upload'],
      options: {
        '--package [package]': {
          usage: '需要发布的包目录',
          config: {}
        },
        '--registry': {
          usage: '发布的源地址'
        },
        '--ci': {
          usage: '是否在ci/cd中'
        },
        '--verbose': {
          usage: '是否显示详细的日志信息'
        }
      }
    },
    start: {
      describe: 'start a material package',
      lifecycleEvents: ['dev']
    },
    // TODO: Remove in minor
    fire: {
      commands: {
        build: {
          describe: 'publish a material package',
          lifecycleEvents: ['build', 'file', 'publish', 'upload'],
          options: {
            '--package [package]': {
              usage: '需要发布的包目录',
              config: {}
            },
            '--registry': {
              usage: '发布的源地址'
            },
            '--ci': {
              usage: '是否在ci/cd中'
            },
            '--verbose': {
              usage: '是否显示详细的日志信息'
            }
          }
        },
        start: {
          describe: 'start a material package',
          lifecycleEvents: ['dev']
        }
      }
    }
  };

  answer = {};

  hooks = {
    // 'before:build:publish': async (): Promise<void> => {
    //   const [changes, updatePacksges] = await collectMatiralUpdates();
    //   if (changes && changes.length) {
    //     output('');
    //     output('Changes:');
    //     output(changes.join(os.EOL));
    //     output('');
    //   } else {
    //     Logger.info(chalk.green(`all materials is updated`));
    //     return;
    //   }
    //   console.log('updatePacksges', updatePacksges);
    //   // use this opportunity to confirm publishing
    //   const { pub } = await runPrompts({
    //     type: 'confirm',
    //     name: 'pub',
    //     message: 'Are you sure you want to publish these packages?'
    //   });
    //   const buildResolved = updatePacksges.map((pack) => pack.resolved);
    //   if (!pub) return;
    //   await build(buildResolved.map((res) => res.fetchSpec));
    // },
    'build:build': async (): Promise<void> => {
      await build();
    },
    'fire:build:build': async (): Promise<void> => {
      const fireBuildInfo =
        'winex fire build 命令已经被 winex build 代替，winex fire build 将在下个minor版本移除，请及时修改。';
      console.log();
      console.log(chalk.red.bold(fireBuildInfo));
      await build();
    },
    // 'build:publish': publish,
    'start:dev': async (): Promise<void> => {
      console.log('fire start');
      await runStart();
    },
    'fire:start:dev': async (): Promise<void> => {
      const fireStartInfo =
        'winex fire start 命令已经被 winex start 代替，winex fire start 将在下个minor版本移除，请及时修改。';
      console.log();
      console.log(chalk.red.bold(fireStartInfo));
      await runStart();
    }
  };
}
