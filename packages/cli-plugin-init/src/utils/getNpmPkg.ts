import chalk from "chalk";

import { GotOptions } from "../interface/package";

const got = require("got");
const semver = require("semver");
const registryAuthToken = require("registry-auth-token");

class VersionNotFoundError extends Error {
  constructor(packageName: string, version: string) {
    super(
      `Version ${chalk.cyan(version)} for package ${chalk.cyan(
        packageName
      )} could not be found`
    );
    this.name = "VersionNotFoundError";
  }
}

class PackageNotFoundError extends Error {
  constructor(packageName: string) {
    super(`Package ${chalk.cyan(packageName)} could not be found`);
    this.name = "PackageNotFoundError";
  }
}

/**
 *
 * @param {String} pluginName -- full name of the package to get
 * @param {Object} options -- options
 *
 * 读取package.json文件
 */
export const getNpmPkg = async (packageName: string, options: GotOptions) => {
  const url = require("url");

  let { version, registryUrl } = options;
  registryUrl = /\/$/.test(registryUrl) ? registryUrl : `${registryUrl}/`

  const packageUrl = url.resolve(registryUrl, packageName);
  const authInfo = registryAuthToken(registryUrl.toString(), {
    recursive: true,
  });

  let headers: any = {
    accept:
      "application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8, */*",
  };

  if (authInfo) {
    headers.authorization = `${authInfo.type} ${authInfo.token}`;
  }

  const gotOptions = {
    json: true,
    headers,
  };

  let response;
  try {
    response = await got(packageUrl, gotOptions);
  } catch (error) {
    if (error.statusCode === 404) {
      throw new PackageNotFoundError(packageName);
    }
    throw error;
  }

  let data = response.body;

  const versionError = new VersionNotFoundError(packageName, version);

  if (data["dist-tags"][version]) {
    // 分布标签 补充语义版本控制
    data = data.versions[data["dist-tags"][version]];
  } else if (version) {
    if (!data.versions[version]) {
      const versions = Object.keys(data.versions);
      version = semver.maxSatisfying(versions, version); // 语义化版本规范规则

      if (!version) {
        throw versionError;
      }
    }

    data = data.versions[version];

    if (!data) {
      throw versionError;
    }
  }

  return data;
};
