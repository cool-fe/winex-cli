import { BasePlugin } from '@winfe/cli-core';
import chalk from 'chalk';
import log from 'npmlog';
import os from 'os';
import Logger from './logger';
import { collectMatiralUpdates } from './package';
import build from './build';
import { runPrompts } from './prompts';

function output(...args: string[]) {
  log.clearProgress();
  console.log(...args);
  log.showProgress();
}

export type PluginOptions = {
  package: string;
  registry: boolean;
  ci?: boolean;
};

export default class LintPlugin extends BasePlugin {
  commands = {
    lint: {
      publish: 'publish a material package',
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
    }
  };

  answer = {};

  hooks = {
    'before:lint:publish': async (content: any) => {
      const [changes, updatePacksges] = await collectMatiralUpdates();
      if (changes && changes.length) {
        output('');
        output('Changes:');
        output(changes.join(os.EOL));
        output('');
      } else {
        Logger.info(chalk.green(`all materials is updated`));
        return;
      }
      console.log('updatePacksges', updatePacksges);
      // use this opportunity to confirm publishing
      const { publish } = await runPrompts({
        type: 'confirm',
        name: 'publish',
        message: 'Are you sure you want to publish these packages?'
      });
      const buildResolved = updatePacksges.map((pack) => pack.resolved);
      if (!publish) return;
      await build(buildResolved.map((res) => res.fetchSpec));
    },
    'lint:init': async (content: any) => {
      console.log('init');
    },
    'after:lint:init': async (content: any) => {
      Logger.info(chalk`\n🎉{bold Successfully linted. happy coding~}\n`);
      Logger.info(chalk`\t{bold To get started：}`);
      Logger.info(chalk`\t{bold Reload the  editor & experience}\n`);
    }
  };
}
