import { BaseCLI } from '@winfe/cli-core'
import { execSync } from 'child_process'

const plugins: {
  [key: string]: { mod: string; name: string }[] | { mod: string; name: string }
} = {
  lint: { mod: '@winfe/cli-plugin-lint', name: 'LintPlugin' }
}

export class CLI extends BaseCLI {
  async loadDefaultPlugin() {
    // 获取this.commands[0]，只加载相关命令的插件
    const command = this.commands && this.commands[0]
    // version not load plugin
    if (this.argv.v || this.argv.version) {
      return
    }
    super.loadDefaultPlugin()
    let needLoad: { mod: string; name: string }[] = []
    if (!this.argv.h && command) {
      if (plugins[command]) {
        needLoad = needLoad.concat(plugins[command])
      }
    } else {
      // load all
      Object.keys(plugins).forEach((cmd: string) => {
        needLoad = needLoad.concat(plugins[cmd])
      })
    }
    needLoad.forEach((pluginInfo) => {
      try {
        let mod = require(pluginInfo.mod)
        mod = mod.default || mod
        if (mod) this.core.addPlugin(mod)
      } catch (e) {
        console.log(123, e)
        /** ignore */
      }
    })
  }

  async loadPlugins() {
    await this.loadDefaultOptions()
    await super.loadPlugins()
  }

  async loadDefaultOptions() {
    if (this.commands.length && !(this.argv.v || this.argv.version)) {
      return
    }

    if (this.argv.v || this.argv.version) {
      this.displayVersion()
    }
  }

  displayVersion() {
    const log = this.loadLog()
    try {
      const nodeVersion = execSync('node -v').toString().replace('\n', '')
      log.log('Node.js'.padEnd(20) + nodeVersion)
    } catch (E) {
      /** ignore */
    }

    try {
      // midway-faas version
      const cliVersion = require('../package.json').version
      log.log('@winfe/winex-cli'.padEnd(20) + `v${cliVersion}`)
    } catch (E) {
      /** ignore */
    }
  }

  displayUsage(commandsArray: any, coreInstance: any) {
    this.displayVersion()
    super.displayUsage(commandsArray, coreInstance)
  }
}
