import { AddOptions } from './interface';

import chalk from "chalk";
import { BasePlugin } from "@winfe/cli-core";

const { commands } = require('./commands');
const { checkPackageJson } = require('./utils/getPackageJson');
const configTransform = require('./utils/configTransform')
const PackageManager = require('./utils/PackageManager');
const downloadPackage = require('./utils/downloadPackage');
const syncInstallDeps = require('./utils/syncInstallDeps');
const GetMaterial = require('./utils/GetMaterial');

export default class AddPlugin extends BasePlugin {
  // todo
  // context = process.cwd();
  context = 'D:/Winningfor6.0/winex-cli/test';

  commands = commands;

  hooks = {
    "before:add:add": this.beforeAdd.bind(this),
    "add:add": this.add.bind(this),
  };

  async beforeAdd(): Promise<void> {
    await checkPackageJson(this.context);
  }

  async add(content: any): Promise<void> {
    const { plugin, pm } = content?.parsedOptions?.options;

    const pluginRe = /^(@?[^@]+)(?:@(.+))?$/;
    let [
      _skip,
      pluginName,
      pluginVersion
    ] = plugin.match(pluginRe);
    const getNpm = new GetMaterial(pluginName, pluginVersion);
    const { type, registry, dependencies, tarball, core, npm } = await getNpm.getConfig();

    if (type === 'npm') {
      await this.installPackages({
        pluginName: npm, pluginVersion, pm, registry
      }); // ensure pluginName add scope
    } else {
      await this.download({
        pluginName: npm, tarball, core, pm, remote: dependencies,
      }); // ensure pluginName add scope
    }
  }

  /**
   *
   * @param {String} pluginName -- full name of the package to get
   * @param {String} pluginVersion -- version to download
   * @param {String} pm -- node
   * @param {String} registry
   *
   * npm install and create config
   */
  async installPackages({ pluginName, pluginVersion = "latest", pm, registry }: AddOptions): Promise<void> {
    console.log(chalk.bold(`📦 Installing ${chalk.cyan(pluginName)}...`));

    const pkm = new PackageManager(
      this.context, pm, registry
    );
    await pkm.add(`${pluginName}@${pluginVersion}`);
    await configTransform(pluginName, this.context);

    console.log(chalk.bold(`${chalk.green('✔')}  Successfully installed plugin: ${chalk.cyan(pluginName)}`));
  }

  /**
   *
   * @param {String} pluginName -- full name of the package to get
   * @param {String} tarball -- the url of dist tgz
   * @param {String} core
   * @param {String} pm
   * @param {String} remote
   *
   * Download tgz and decompression
   */
  async download({ pluginName, tarball, core, pm, remote }: AddOptions): Promise<void> {
    const path = await downloadPackage({ pluginName, tarball, core, context: this.context });
    if (path) {
      const resolvedDeps = await syncInstallDeps(remote, this.context);
      if (resolvedDeps) {
        const pkm = new PackageManager(
          this.context, pm,
        );
        await pkm.add(resolvedDeps);
      }
      console.log(chalk.bold(`${chalk.green('✔')}  Successfully downloaded in ${chalk.cyan(path)}`));
    }
  }
}
