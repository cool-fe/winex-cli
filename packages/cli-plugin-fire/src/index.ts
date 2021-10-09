import { BasePlugin } from '@winfe/cli-core';
import chalk from 'chalk';
import publish from './publish/index';

export type PluginOptions = {
  package: string;
  registry: boolean;
  ci?: boolean;
};

export default class LintPlugin extends BasePlugin {
  commands = {
    build: {
      describe: 'build a project',
      lifecycleEvents: ['build'],
      options: {
        '--old-build': {
          usage: '是否起用旧的build'
        },
        '--component': {
          usage: '打包组件物料'
        },
        '--app-type': {
          usage: 'app类型,区分打包的是物料还是spa项目',
          config: {
            default: 'material'
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
        '--beta [patch | minor | major]': {
          usage: '发布beta版本',
          config: {}
        },
        '--release [patch | minor | major]': {
          usage: '发布release版本',
          config: {}
        },
        '--old-build': {
          usage: '是否起用旧的build'
        },
        '--package [package]': {
          usage: '需要发布的包目录',
          config: {}
        },
        '--registry [registry]': {
          usage: '发布的源地址',
          config: {}
        },
        '--upload': {
          usage: '打包组件物料后是否上传到minio'
        },
        '--skip-push': {
          usage: '是否跳过git push代码'
        },
        '--skip-upload-material-data': {
          usage: '是否跳过上传物料数据'
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
        '--old-dev': {
          usage: '是否起用旧的dev'
        },
        '--app-type': {
          usage: 'app类型,区分打包的是物料还是spa项目',
          config: {
            default: 'material'
          }
        }
      },
      lifecycleEvents: ['dev']
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
      process.env.APP_ROOT = process.cwd();
      process.env.APP_TYPE = parsedOptions.options.appType;
      require('@winfe/vmi/lib/cli');
    },
    'fire:build:build': async (): Promise<void> => {
      const fireBuildInfo = 'winex fire build 命令已经被 winex build 代替，请使用 winex build。';
      console.log();
      console.log(chalk.red.bold(fireBuildInfo));
    },
    'dev:dev': async ({ parsedOptions }: any): Promise<void> => {
      process.env.APP_ROOT = process.cwd();
      process.env.APP_TYPE = parsedOptions.options.appType;
      require('@winfe/vmi/lib/cli');
    },
    'fire:start:dev': async (): Promise<void> => {
      const fireStartInfo = 'winex fire start 命令已经被 winex dev 代替，请使用 winex dev。';
      console.log();
      console.log(chalk.red.bold(fireStartInfo));
    }
  };
}
