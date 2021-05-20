import {
  AddOptions, GetMaterialOptions, CommandsOptions
} from './interface';
import chalk from "chalk";
import { BasePlugin } from "@winfe/cli-core";
import { commands } from './commands';
import {
  checkPackageJson,
  configTransform,
  PackageManager,
  downloadPackage,
  syncInstallDeps,
  GetMaterial,
  match,
} from "./utils/index";

export default class AddPlugin extends BasePlugin {
  context = process.cwd(); // context path

  commands = commands;

  hooks = {
    "before:add:add": this.beforeAdd.bind(this),
    "add:add": this.add.bind(this),
  };

  async beforeAdd(): Promise<void> {
    await checkPackageJson(this.context);
  }

  async add(content: any): Promise<void> {
    const { plugin, pm }: CommandsOptions = content?.parsedOptions?.options;
    if (!plugin) return;

    const matchResult = match(plugin); // format plugin
    if (matchResult) {
      const { pluginName, pluginVersion } = matchResult;

      const getNpm = new GetMaterial(pluginName, pluginVersion);
      const {
        type, registry, dependencies, tarball, core, npm,
      }: GetMaterialOptions = await getNpm.getConfig();

      const params: AddOptions = {
        pluginName: npm, // ensure pluginName add scope
        pluginVersion,
        pm,
        registry,
        tarball,
        core,
        remoteDeps: dependencies,
      };

      if (type === 'npm') {
        await this.installPackages(params);
      } else {
        await this.download(params);
      }
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
  async installPackages(
    { pluginName, pluginVersion = "latest", pm, registry }: AddOptions
  ): Promise<void> {
    console.log(chalk.bold(`📦 Installing ${chalk.cyan(pluginName)}...`));

    const pkm = new PackageManager(
      this.context, pm, registry
    );
    await pkm.add(`${pluginName}@${pluginVersion}`);

    configTransform(pluginName, this.context);

    console.log(chalk.bold(`${chalk.green('✔')}  Successfully installed plugin: ${chalk.cyan(pluginName)}`));
  }

  /**
   *
   * @param {String} pluginName -- full name of the package to get
   * @param {String} tarball -- the url of dist tgz
   * @param {String} core
   * @param {String} pm
   * @param {String} remoteDeps
   *
   * Download tgz and decompression
   */
  async download(
    { pluginName, tarball, pm, remoteDeps, registry }: AddOptions
  ): Promise<void> {
    const path = await downloadPackage(pluginName, tarball, this.context);
    if (!!path) {
      const resolvedDeps = await syncInstallDeps(remoteDeps, this.context);
      if (resolvedDeps && resolvedDeps.length > 0) {
        const pkm = new PackageManager(
          this.context, pm, registry,
        );
        await pkm.add(resolvedDeps);
      }
      console.log(chalk.bold(`${chalk.green('✔')}  Successfully downloaded in ${chalk.cyan(path)}`));
    }
  }
}
