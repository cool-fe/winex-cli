/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable node/no-extraneous-import */
import chalk from 'chalk';
import { resolve } from 'path';
import { BasePlugin } from '@winfe/cli-core';
//@ts-ignore
import { dev, build } from '@vuepress/core';

const MATERIAL_DOC_DIR = resolve(__dirname, '../docs');

const OPTIONS = {
  theme: '@vuepress/default'
};

export default class DocPlugin extends BasePlugin {
  cwd = process.cwd(); // context path

  commands = {
    doc: {
      commands: {
        dev: {
          describe: 'start development server of doc',
          lifecycleEvents: ['dev'],
          options: {
            '-p, --port [port]': {
              usage: 'use specified port (default: 8080)',
              config: {
                default: 8080
              }
            },
            '-t, --temp [temp]': {
              usage: 'set the directory of the temporary file',
              config: {}
            },
            '-c, --cache [cache]': {
              usage: 'set the directory of cache',
              config: {}
            },
            '--host [host]': {
              usage: 'use specified host (default: 0.0.0.0)',
              config: {
                default: '0.0.0.0'
              }
            },
            '--no-cache': {
              usage: 'clean the cache before build',
              config: {}
            },
            '--no-clear-screen': {
              usage: 'do not clear screen when dev server is ready',
              config: {}
            },
            '--debug': {
              usage: 'start development server in debug mode',
              config: {}
            },
            '--silent': {
              usage: 'start development server in silent mode',
              config: {}
            },
            '--open': {
              usage: 'open browser when ready',
              config: {}
            }
          }
        }, //[targetDir]
        build: {
          describe: 'build dir as static site',
          lifecycleEvents: ['build'],
          options: {
            '--dest [dest]': {
              usage: 'specify build output dir (default: .vuepress/dist)',
              config: {
                default: 'doc-dist',
                shortcut: '-d'
              }
            },
            '--temp [temp]': {
              usage: 'set the directory of the temporary file',
              config: {}
            },
            '--cache [cache]': {
              usage: 'set the directory of cache',
              shortcut: '-t',
              config: {}
            },
            '--no-cache': {
              usage: 'clean the cache before build',
              config: {}
            },
            '--debug': {
              usage: 'start development server in debug mode',
              config: {}
            },
            '--silent': {
              usage: 'start development server in silent mode',
              config: {}
            }
          }
        } //[targetDir]
      }
    }
  };

  hooks = {
    'doc:dev:dev': async function doc({ parsedOptions }: any): Promise<void> {
      console.log(chalk.green('start doc server'));
      await dev({
        sourceDir: resolve(MATERIAL_DOC_DIR),
        ...OPTIONS,
        ...parsedOptions
      });
    },
    'doc:build:build': async function doc({ parsedOptions }: any): Promise<void> {
      console.log(chalk.green('build doc site'));
      const { componentConfig } = require(resolve(process.cwd(), 'package.json'));

      if (!componentConfig) {
        console.log('no material config  name');
        process.exit(0);
      }

      if (!componentConfig.name || !componentConfig.category || !componentConfig.title) {
        console.log('no material config invid');
        process.exit(0);
      }

      process.env.MATERIAL_NAME = componentConfig.name.split('@winex-comp/')[1];
      process.env.MATERIAL_CATEGORY = componentConfig.category;
      process.env.MATERIAL_TITLE = componentConfig.title;

      await build({
        sourceDir: resolve(MATERIAL_DOC_DIR),
        ...OPTIONS,
        ...parsedOptions.options
      });
    }
  };
}
