import fs from "fs";
import spawn from "cross-spawn";
import path from "path";
import { Logger } from "../logger";
import pmTool from "./pm_tool";
import chalk from "chalk";

/**
 * Find the closest package.json file, starting at process.cwd (by default),
 * and working up to root.
 */
function findPackageJson(startDir: string = process.cwd()) {
  let dir = path.resolve(startDir);
  do {
    const pkgFile = path.join(dir, "package.json");
    if (!fs.existsSync(pkgFile) || !fs.statSync(pkgFile).isFile()) {
      dir = path.join(dir, "..");
      continue;
    }
    return pkgFile;
  } while (dir !== path.resolve(dir, ".."));
  return null;
}

const sleep = (time: number) => {
  return new Promise<void>((resolve) => {
    setTimeout(() => resolve(), time * 1000);
  });
};

/**
 * Install  modules synchronously and save to devDependencies in package.json
 */
export async function installSaveDev(
  packages: string[] | string,
  version?: string,
  assignPmTool?: string
): Promise<boolean> {
  return new Promise(async (resolve, reject) => {
    const pmToolName = assignPmTool || (await pmTool());
    const packageVersionStr = version ? `@${version}` : "@latest";
    const packageList = Array.isArray(packages)
      ? packages.map((pack) => `${pack}${packageVersionStr}`)
      : [`${packages}${packageVersionStr}`];
    const cliArgus =
      pmToolName === "yarn" ? ["add", "--dev"] : ["install", "--save-dev"];
    try {
      const npmProcess = spawn(pmToolName, cliArgus.concat(packageList), {
        stdio: "pipe",
      });

      npmProcess.stdout && npmProcess.stdout.on("data", (data) => {});

      npmProcess.stderr &&
        npmProcess.stderr.on("data", (data) => {
          const isError = `${data}`.trim().slice(0, 5) === "error";
          if (isError) {
            Logger.error(chalk.red(`\n${data}`));
            const pluralS = packageList.length > 1 ? "s" : "";
            Logger.error(
              chalk.red(
                `\nCould not execute ${pmToolName}. Please install the following package${pluralS} with a package manager of your choice: ${packageList.join(
                  ", "
                )}`
              )
            );
            process.exit(0);
          }
        });

      npmProcess.on("close", (code) => {
        resolve(true);
      });
    } catch (error) {
      Logger.error(chalk.red(`\n ${error}`));
      process.exit(0);
    }
  });
}

/**
 * Fetch `peerDependencies` of the given package by `npm show` command.
 * @param {string} packageName The package name to fetch peerDependencies.
 * @returns {Object} Gotten peerDependencies. Returns null if npm was not found.
 */
export function fetchPeerDependencies(packageName: string) {
  const npmProcess = spawn.sync(
    "npm",
    ["show", "--json", packageName, "peerDependencies"],
    { encoding: "utf8" }
  );

  const error = npmProcess.error;
  //@ts-ignore
  if (error && error.code === "ENOENT") {
    return null;
  }
  const fetchedText = npmProcess.stdout.trim();

  return JSON.parse(fetchedText || "{}");
}

/**
 * Check whether node modules are include in a project's package.json.
 * @param   {string[]} packages           Array of node module names
 * @param   {Object}  opt                 Options Object
 * @param   {boolean} opt.dependencies    Set to true to check for direct dependencies
 * @param   {boolean} opt.devDependencies Set to true to check for development dependencies
 * @param   {boolean} opt.startdir        Directory to begin searching from
 * @returns {Object}                      An object whose keys are the module names
 *                                        and values are booleans indicating installation.
 */
function check(
  packages: string[],
  opt: {
    [x: string]: any;
    dependencies?: boolean;
    startDir?: any;
    devDependencies?: boolean;
  }
) {
  const deps = new Set();
  const pkgJson = opt ? findPackageJson(opt.startDir) : findPackageJson();
  let fileJson: { [x: string]: {} };

  if (!pkgJson) {
    throw new Error(
      "Could not find a package.json file. Run 'npm init' to create one."
    );
  }

  try {
    fileJson = JSON.parse(fs.readFileSync(pkgJson, "utf8"));
  } catch (e) {
    const error = new Error(e);
    //@ts-ignore
    error.messageTemplate = "failed-to-read-json";
    //@ts-ignore
    error.messageData = {
      path: pkgJson,
      message: e.message,
    };
    throw error;
  }

  ["dependencies", "devDependencies"].forEach((key) => {
    if (opt[key] && typeof fileJson[key] === "object") {
      Object.keys(fileJson[key]).forEach((dep) => deps.add(dep));
    }
  });

  return packages.reduce((status: { [x: string]: boolean }, pkg: string) => {
    status[pkg] = deps.has(pkg);
    return status;
  }, {});
}

/**
 * Check whether node modules are included in the dependencies of a project's
 * package.json.
 *
 * Convenience wrapper around check().
 * @param   {string[]} packages  Array of node modules to check.
 * @param   {string}   rootDir   The directory containing a package.json
 * @returns {Object}             An object whose keys are the module names
 *                               and values are booleans indicating installation.
 */
export function checkDeps(packages: string[], rootDir: any) {
  return check(packages, { dependencies: true, startDir: rootDir });
}

/**
 * Check whether node modules are included in the devDependencies of a project's
 * package.json.
 *
 * Convenience wrapper around check().
 * @param   {string[]} packages  Array of node modules to check.
 * @returns {Object}             An object whose keys are the module names
 *                               and values are booleans indicating installation.
 */
export function checkDevDeps(packages: string[]) {
  return check(packages, { devDependencies: true });
}

/**
 * Check whether package.json is found in current path.
 * @param   {string} [startDir] Starting directory
 * @returns {boolean} Whether a package.json is found in current path.
 */
export function checkPackageJson(startDir: string) {
  return !!findPackageJson(startDir);
}
