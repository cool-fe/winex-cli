import chalk from 'chalk';
import { GetMaterialOptions } from '../interface';
import { error } from './logger';

const semver = require('semver');
const { getmaterialinfo } = require('@winexmaterials/get-materials');

class PackageNotFoundError extends Error {
  constructor(pluginName: string) {
    super(`Package ${chalk.cyan(pluginName)} could not be found, please check the spelling right`);
    this.name = 'PackageNotFoundError';
  }
}

class RegularNotFoundError extends Error {
  constructor(pluginName: string, version: string) {
    super(`Couldn't find any versions for ${chalk.cyan(pluginName)} that matches ${chalk.cyan(version)}`);
    this.name = 'RegularNotFoundError';
  }
}

export class GetMaterial {
  pluginName: string
  pluginVersion: string

  constructor(pluginName: string, pluginVersion: string) {
    this.pluginName = pluginName;
    this.pluginVersion = pluginVersion;
  }

  async getConfig(): Promise<GetMaterialOptions> {
    const materialInfo = getmaterialinfo(this.pluginName);

    if (materialInfo.length <= 0) {
      throw new PackageNotFoundError(this.pluginName);
    }

    let { dependencies, source } = materialInfo[0];

    let { version, type, npm, registry } = source;

    if (type !== 'npm' && !!this.pluginVersion) {
      if (!semver.valid(this.pluginVersion)) { // todo: download：不支持 dist-tags
        throw new RegularNotFoundError(this.pluginName, this.pluginVersion);
      } else {
        version = this.pluginVersion;
      }
    }

    // scoped packages
    const name = npm[0] === '@' ? npm.slice(npm.indexOf('/') + 1) : npm;

    const params = {
      npm,
      type,
      registry,
      tarball: `${registry}${npm}/-/${name}-${version}.tgz`,
    };

    for (const key in params) {
      if (params[key] === '') {
        error(`${chalk.cyan(this.pluginName)}: lack of ${chalk.cyan(key)}, please contact the developers`);
        process.exit(1);
      }
    }

    return Object.assign(params, { dependencies, core: [] });
  }
}
