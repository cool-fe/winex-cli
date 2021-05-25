/**
 * @author dashixiong
 * @description Helper to locate and load configuration files.
 */

import { Logger } from "../logger";
import fs from "fs";
import path from "path";
import stripComments from "strip-json-comments";
//@ts-ignore
import stringify from "json-stable-stringify-without-jsonify";
import importFresh from "import-fresh";

export type configName =
  | ".eslintrc.yaml"
  | ".eslintrc.yml"
  | ".eslintrc.json"
  | ".eslintrc"
  | "package.json"
  | ".eslintrc.js";

/**
 * Determines sort order for object keys for json-stable-stringify
 * see: https://github.com/samn/json-stable-stringify#cmp
 * @param   {Object} a The first comparison object ({key: akey, value: avalue})
 * @param   {Object} b The second comparison object ({key: bkey, value: bvalue})
 * @returns {number}   1 or -1, used in stringify cmp method
 */
function sortByKey(a: { key: number }, b: { key: number }) {
  return a.key > b.key ? 1 : -1;
}

export const CONFIG_FILES: configName[] = [
  ".eslintrc",
  ".eslintrc.yaml",
  ".eslintrc.yml",
  ".eslintrc.json",
  ".eslintrc.js",
  "package.json",
];

/**
 * Convenience wrapper for synchronously reading file contents.
 */
function readFile(filePath: string) {
  return fs.readFileSync(filePath, "utf8").replace(/^\ufeff/u, "");
}

/**
 * Loads a YAML configuration from a file.
 */
function loadYAMLConfigFile(filePath: string) {
  Logger.debug(`Loading YAML config file: ${filePath}`);
  // lazy load YAML to improve performance when not used
  const yaml = require("js-yaml");

  try {
    // empty YAML file can be null, so always use
    return yaml.safeLoad(readFile(filePath)) || {};
  } catch (e) {
    Logger.debug(`Error reading YAML file: ${filePath}`);
    e.message = `Cannot read config file: ${filePath}\nError: ${e.message}`;
    throw e;
  }
}

/**
 * Loads a JSON configuration from a file.
 */
function loadJSONConfigFile(filePath: string) {
  Logger.debug(`Loading JSON config file: ${filePath}`);

  try {
    return JSON.parse(stripComments(readFile(filePath)));
  } catch (e) {
    Logger.debug(`Error reading JSON file: ${filePath}`);
    e.message = `Cannot read config file: ${filePath}\nError: ${e.message}`;
    e.messageTemplate = "failed-to-read-json";
    e.messageData = {
      path: filePath,
      message: e.message,
    };
    throw e;
  }
}

/**
 * Loads a legacy (.eslintrc) configuration from a file.
 */
function loadLegacyConfigFile(filePath: string) {
  Logger.debug(`Loading config file: ${filePath}`);

  // lazy load YAML to improve performance when not used
  const yaml = require("js-yaml");

  try {
    return (
      yaml.safeLoad(stripComments(readFile(filePath))) ||
      /* istanbul ignore next */ {}
    );
  } catch (e) {
    Logger.debug(`Error reading YAML file: ${filePath}`);
    e.message = `Cannot read config file: ${filePath}\nError: ${e.message}`;
    throw e;
  }
}

/**
 * Loads a JavaScript configuration from a file.
 */
function loadJSConfigFile(filePath: string) {
  Logger.debug(`Loading JS config file: ${filePath}`);
  try {
    return importFresh(filePath);
  } catch (e) {
    Logger.debug(`Error reading JavaScript file: ${filePath}`);
    e.message = `Cannot read config file: ${filePath}\nError: ${e.message}`;
    throw e;
  }
}

/**
 * Loads a configuration from a package.json file.
 */
function loadPackageJSONConfigFile(filePath: any) {
  Logger.debug(`Loading package.json config file: ${filePath}`);
  try {
    return loadJSONConfigFile(filePath).eslintConfig || null;
  } catch (e) {
    Logger.debug(`Error reading package.json file: ${filePath}`);
    e.message = `Cannot read config file: ${filePath}\nError: ${e.message}`;
    throw e;
  }
}

/**
 * Creates an error to notify about a missing config to extend from.
 */
function configMissingError(configName: any) {
  const error = new Error(
    `Failed to load config "${configName}" to extend from.`
  );
  //@ts-ignore
  error.messageTemplate = "extend-config-missing";
  //@ts-ignore
  error.messageData = {
    configName,
  };
  return error;
}

/**
 * Loads a configuration file regardless of the source. Inspects the file path
 * to determine the correctly way to load the config file.
 */
export function loadConfigFile(file: {
  configName?: any;
  configFullName?: any;
  filePath?: any;
}) {
  const { filePath } = file;
  let config;

  switch (path.extname(filePath)) {
    case ".js":
      config = loadJSConfigFile(filePath);
      if (file.configName) {
        //@ts-ignore
        config = config.configs[file.configName];
        if (!config) {
          throw configMissingError(file.configFullName);
        }
      }
      break;

    case ".json":
      if (path.basename(filePath) === "package.json") {
        config = loadPackageJSONConfigFile(filePath);
        if (config === null) {
          return null;
        }
      } else {
        config = loadJSONConfigFile(filePath);
      }
      break;

    case ".yaml":
    case ".yml":
      config = loadYAMLConfigFile(filePath);
      break;

    default:
      config = loadLegacyConfigFile(filePath);
  }

  return config;
}

/**
 * Writes a configuration file in JavaScript format.
 */
function writeJSConfigFile(config: object, filePath: any) {
  Logger.debug(`Writing JS config file: ${filePath}`);

  const stringifiedContent = `module.exports = ${stringify(config, {
    cmp: sortByKey,
    space: 4,
  })};`;

  fs.writeFileSync(filePath, stringifiedContent, "utf8");
}

/**
 * Writes a configuration file.
 */
export function write(config: any, filePath: any) {
  switch (path.extname(filePath)) {
    case ".js":
      writeJSConfigFile(config, filePath);
      break;

    case ".json":
      writeJSONConfigFile(config, filePath);
      break;

    case ".yaml":
    case ".yml":
      writeYAMLConfigFile(config, filePath);
      break;

    default:
      throw new Error("Can't write to unknown file type.");
  }
}

/**
 * Checks whether the given filename points to a file
 */
function isExistingFile(filename: string) {
  try {
    return fs.statSync(filename).isFile();
  } catch (err) {
    if (err.code === "ENOENT") {
      return false;
    }
    throw err;
  }
}

export function checkEslintConfig(directory: string = process.cwd()) {
  let checkResult = CONFIG_FILES.filter((filename) =>
    isExistingFile(path.join(directory, filename))
  );

  try {
    //判断一次package.json里是否真正有eslintConfig
    const eslintRcPackage = `${process.cwd()}/package.json`;
    // 对旧的配置做合并处理
    if (!loadConfigFile({ filePath: eslintRcPackage })) {
      checkResult = checkResult.filter(
        (filename) => filename !== "package.json"
      );
    }
  } catch (error) {
    checkResult = checkResult.filter((filename) => filename !== "package.json");
  }

  return checkResult;
}

export function getFilenameForDirectory(directory: string) {
  return CONFIG_FILES.map((filename) => path.join(directory, filename)).find(
    isExistingFile
  );
}
