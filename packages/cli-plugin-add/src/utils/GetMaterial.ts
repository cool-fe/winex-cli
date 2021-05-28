import chalk from "chalk";
import { GetMaterialOptions } from "../interface/index";
import { error } from "./logger";

const semver = require("semver");
const { getmaterialinfo } = require("@winfe/get-materials");

class PackageNotFoundError extends Error {
  constructor(pluginName: string) {
    super(
      `Package ${chalk.cyan(
        pluginName
      )} could not be found, please check the spelling right`
    );
    this.name = "PackageNotFoundError";
  }
}

class RegularError extends Error {
  constructor(pluginName: string) {
    super(
      `You must specify the version number for package ${chalk.cyan(pluginName)} `
    );
    this.name = "RegularError";
  }
}

export class GetMaterial {
  pluginName: string;
  pluginVersion: string;

  constructor(pluginName: string, pluginVersion: string) {
    this.pluginName = pluginName;
    this.pluginVersion = pluginVersion;
  }

  async getConfig(): Promise<GetMaterialOptions> {
    const materialInfo = await getmaterialinfo(this.pluginName);

    if (materialInfo.length <= 0) {
      throw new PackageNotFoundError(this.pluginName);
    }

    let { dependencies, source } = materialInfo[0];

    let { version, type, npm, registry } = source; // version: latest

    if (!!this.pluginVersion) {
      const isReg = !semver.valid(this.pluginVersion) && this.pluginVersion !== 'latest';
      if (isReg) {
        throw new RegularError(npm);
      }
      version = this.pluginVersion;
    }

    // scoped packages
    const [_scope, name] = npm.split("/"); // scope

    const params = {
      npm,
      type,
      registry,
      version,
      tarball: `${registry}${npm}/-/${name}-${version}.tgz`,
    };

    for (const key in params) {
      if (params[key] === "") {
        error(
          `${chalk.cyan(npm)}: lack of ${chalk.cyan(
            key
          )}, please contact the developers`
        );
        process.exit(1);
      }
    }

    return {dependencies, core: [], ...params};
  }
}
