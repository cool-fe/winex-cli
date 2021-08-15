import { BasePlugin } from '@winfe/cli-core';
import chalk from 'chalk';
import Logger from './logger';
import build from './build';
import publish from './publish/index';

import App from './core/App';

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
      describe: 'build a project',
      lifecycleEvents: ['build'],
      options: {
        '--vmi': {
          usage: '是否以vmi启动'
        },
        '--component': {
          usage: '打包组件物料'
        },
        '--upload': {
          usage: '打包组件物料后是否上传到minio'
        },
        '--ci': {
          usage: '是否在ci/cd中'
        },
        '--verbose': {
          usage: '是否显示详细的日志信息'
        }
      }
    },
    publish: {
      describe: 'publish a  package',
      lifecycleEvents: ['publish'],
      options: {
        '--mode [mode]': {
          usage: '指定发布模式：normal ｜ lerna',
          config: {
            default: 'normal'
          }
        },
        '--package [package]': {
          usage: '需要发布的包目录',
          config: {}
        },
        '--registry [registry]': {
          usage: '发布的源地址',
          config: {
            default: 'http://172.16.9.242:8081/repository/npm-local/'
          }
        },
        '--upload': {
          usage: '打包组件物料后是否上传到minio'
        },
        '--ci': {
          usage: '是否在ci/cd中'
        },
        '--verbose': {
          usage: '是否显示详细的日志信息'
        }
      }
    },
    dev: {
      describe: 'start a material package',
      options: {
        '--vmi': {
          usage: '是否以vmi启动'
        }
      },
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
    'publish:publish': async ({ parsedOptions }: any): Promise<void> => {
      await publish(process.cwd(), parsedOptions.options).catch((err) => {
        console.error(err);
        process.exit(1);
      });
    },
    'build:build': async ({ parsedOptions }: any): Promise<void> => {
      if (parsedOptions?.options?.vmi) {
        process.env.APP_ROOT = process.cwd();
        require('@winfe/vmi/lib/cli');
      } else {
        await build();
      }
    },
    'fire:build:build': async (): Promise<void> => {
      const fireBuildInfo =
        'winex fire build 命令已经被 winex build 代替，winex fire build 将在下个minor版本移除，请及时修改。';
      console.log();
      console.log(chalk.red.bold(fireBuildInfo));
      await build();
    },
    // 'build:publish': publish,
    'dev:dev': async ({ parsedOptions }: any): Promise<void> => {
      if (parsedOptions?.options?.vmi) {
        process.env.APP_ROOT = process.cwd();
        require('@winfe/vmi/lib/cli');
      } else {
        await runStart();
      }
    },
    'fire:start:dev': async (): Promise<void> => {
      const fireStartInfo =
        'winex fire start 命令已经被 winex dev 代替，winex fire start 将在下个minor版本移除，请及时修改。';
      console.log();
      console.log(chalk.red.bold(fireStartInfo));
      await runStart();
    }
  };
}
