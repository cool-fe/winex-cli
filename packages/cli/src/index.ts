/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable @typescript-eslint/no-var-requires */
import { BaseCLI } from '@winfe/cli-core';
import { execSync } from 'child_process';

import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: 'https://40872dc20e484cb09d42dc20703311ea@o878996.ingest.sentry.io/5831301',
  tracesSampleRate: 1.0
});

Sentry.configureScope((scope) => {
  const os = require('os');
  const path = require('path');
  const fs = require('fs');
  const ini = require('ini');
  const nodeVersion = execSync('node -v')
    .toString()
    .replace('\n', '');
  const cliVersion = require('../package.json').version;
  scope.setTag('level', 'info');
  scope.setTag('os platform', os.platform());
  scope.setTag('os arch', os.arch());
  scope.setTag('os release', os.release());
  scope.setTag('node', 'Node.js'.padEnd(20) + nodeVersion);
  scope.setTag('cli-version', `${'@winfe/winex-cli'.padEnd(20)}v${cliVersion}`);
  const filePath = path.join(os.homedir(), '.gitconfig');
  if (fs.existsSync(filePath)) {
    const { user = {} } = ini.parse(fs.readFileSync(filePath, 'utf8'));
    scope.setTag('git-name', user.username || user.name);
    scope.setTag('git-name', user.email);
  }
});

const plugins: { mod: string; name: string; command?: string | string[] }[] = [
  { mod: '@winfe/cli-plugin-lint', name: 'LintPlugin', command: 'lint' },
  { mod: '@winfe/cli-plugin-init', name: 'InitPlugin', command: 'init' },
  { mod: '@winfe/cli-plugin-add', name: 'AddPlugin', command: 'add' },
  {
    mod: '@winfe/cli-plugin-fire',
    name: 'FirePlugin',
    command: ['fire', 'dev', 'build', 'publish']
  }
];

// eslint-disable-next-line import/prefer-default-export
export class CLI extends BaseCLI {
  // eslint-disable-next-line complexity
  async loadDefaultPlugin(): Promise<void> {
    // 获取this.commands[0]，只加载相关命令的插件
    const command = this.commands && this.commands[0];
    // version not load plugin
    if (this.argv.v || this.argv.version) {
      return;
    }
    super.loadDefaultPlugin();
    let needLoad: { mod: string; name: string }[] = [];
    if (!this.argv.h && command) {
      Sentry.captureMessage(`[WINEX CLI](command):${command}`);
      needLoad = needLoad.concat(
        ...plugins.filter(
          (plugin) =>
            plugin.command &&
            (typeof plugin.command === 'string'
              ? plugin.command === command
              : plugin.command.includes(command))
        )
      );
    }
    needLoad.forEach((pluginInfo) => {
      try {
        let mod = require(pluginInfo.mod);
        // Compatible with export default and export export
        mod = mod.default || mod;
        if (mod) this.core.addPlugin(mod[pluginInfo.name] || mod);
      } catch (e) {
        console.log(e);
        /** ignore */
      }
    });
  }

  async loadPlugins() {
    await this.loadDefaultOptions();
    await super.loadPlugins();
  }

  async loadDefaultOptions() {
    if (this.commands.length && !(this.argv.v || this.argv.version)) {
      return;
    }

    if (this.argv.v || this.argv.version) {
      this.displayVersion();
    }
  }

  displayVersion() {
    const log = this.loadLog();
    try {
      const nodeVersion = execSync('node -v')
        .toString()
        .replace('\n', '');
      log.log('Node.js'.padEnd(20) + nodeVersion);
    } catch (E) {
      /** ignore */
    }

    try {
      // midway-faas version
      const cliVersion = require('../package.json').version;
      log.log(`${'@winfe/winex-cli'.padEnd(20)}v${cliVersion}`);
    } catch (E) {
      /** ignore */
    }
  }

  displayUsage(commandsArray: any, coreInstance: any) {
    this.displayVersion();
    super.displayUsage(commandsArray, coreInstance);
  }
}
