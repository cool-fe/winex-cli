#!/usr/bin/env node

const chalk = require("chalk");
const path = require("path");
const spawn = require("cross-spawn");

const error = chalk.bold.red;
const info = chalk.bold.green;

info(`start...`);

const { name: packageName } = require(path.resolve(
  process.cwd(),
  "./package.json"
));

const { command } = require(path.resolve(process.cwd(), "./lerna.json"));

const argvs = [
  "publish",
  // "from-package",
  // "--no-git-tag-version",
  // "--conventional-commits",
  // "false",
  "--legacy-auth",
  process.env.NODE_AUTH_TOKEN,
  "--registry",
  "http://registry.npmjs.org/",
  "--yes",
];

//符合semver语义的版本
const semantic = [
  "major",
  "minor",
  "patch",
  "premajor",
  "preminor",
  "prepatch",
  "prerelease",
];

// 自定义preid
/**
 * ["--preid" "beta"]
 */

// 稳定版发测试版
/**
 * ["--conventional-prerelease","--preid" "beta"]
 */

// 测试版发稳定版
/**
 * ["--conventional-graduate"]
 */

if (command.publish && command.publish.version) {
  if (
    typeof command.publish.version === "string" &&
    semantic.includes(command.publish.version)
  ) {
    argvs.push(...["--bump", command.publish.version]);
  } else if (command.publish.version instanceof Array) {
    argvs.push(...command.publish.version);
  }
}

try {
  const ps = spawn(
    path.resolve(process.cwd(), "node_modules/.bin/lerna"),
    argvs,
    {
      stdio: "inherit",
      encoding: "utf-8",
      cwd: process.cwd(),
      env: Object.assign(
        {
          FORCE_COLOR: true,
          npm_config_color: "always",
          npm_config_progress: true,
        },
        process.env
      ),
    }
  );

  ps.on("error", () => {
    throw new Error(`Failed to install ${packageName}\n${ps.stderr}`);
  });

  ps.on("close", () => {
    error(`Installed ${packageName}`);
  });
} catch (error) {
  error(`Failed to install ${error}`);
  process.exit(1);
}
