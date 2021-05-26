import chalk from "chalk";
import {
  writeFileTree,
  loadRemotePreset,
  updateFile,
  gitInfo,
  pathExists,
} from "./utils/index";
import { ICommandOptions, IAnswers, IPackageBaseInfo } from "./interface/index";

import { GROUP_NAME_PREFIX } from "./constants/group";

const execa = require("execa");

export class GenerateTemplate {
  core: any;
  answers: IAnswers;
  options: ICommandOptions;
  context: string;
  outdir: string;
  scaffoldNpmName: string;

  constructor(
    core: any,
    answers: IAnswers,
    options: ICommandOptions,
    context: string,
    outdir: string,
    scaffoldNpmName: string
  ) {
    this.core = core;
    this.answers = answers;
    this.options = options;
    this.context = context;
    this.outdir = outdir;
    this.scaffoldNpmName = scaffoldNpmName;
  }

  /**
   * 获取npm包的基本信息, 包括name、version等
   * @param pkgName 包名称
   * @returns npm包的基本信息
   */
  genNpmInfo(pkgName: string): IPackageBaseInfo {
    const versionIndex = pkgName
      .replace(GROUP_NAME_PREFIX, "")
      .lastIndexOf("@");

    if (versionIndex === -1) {
      return {
        name: pkgName,
        version: "latest",
      };
    }

    return {
      name: pkgName.slice(0, versionIndex),
      version: pkgName.slice(versionIndex + 1) || "latest",
    };
  }

  /**
   * 下载预设项目模板
   */
  async downloadScaffold(): Promise<void> {
    const { name, version } = this.genNpmInfo(this.scaffoldNpmName);
    const { registry } = this.options;

    const result = await loadRemotePreset(
      { name, version, registry },
      this.context
    );

    if (result) {
      this.core.cli.log(
        `\n✨  Creating project in ${chalk.yellow(this.context)}`
      );
    }
  }

  /**
   * 生成README文件
   * todo: 具体输出内容需后续完善
   * @returns
   */
  async generateReadme(): Promise<void> {
    if (pathExists(`${this.context}/README.md`)) return;

    // generate README.md
    this.core.cli.log("\n📄  Generating README.md...");
    const { packageManager } = this.options;

    await writeFileTree(this.context, {
      "README.md": [
        `# ${this.outdir}\n`,
        "## Project setup",
        "```",
        `${packageManager} install`,
        "```",
      ].join("\n"),
    });
  }

  runCommand(command: string, args?: string[]) {
    if (!args) {
      [command, ...args] = command.split(/\s+/);
    }

    return execa(command, args, {
      cwd: this.context,
    });
  }

  /**
   * 初始化git仓库, 主要是git init 和 add remote
   */
  async gitInitialization(): Promise<void> {
    let { repository } = this.answers;

    repository = repository || this.options.repository;

    // init and set remote
    if (repository) {
      this.core.cli.log("🗃   Initializing and setting git repository...");

      await this.runCommand("git init");

      await this.runCommand("git", ["remote", "add", "origin", repository]);
    }
  }

  /**
   * 根据用户的输入及git信息情况更新package.json配置
   * 目前主要更新字段 author、email、name等信息
   * ----------------------------------------
   * 删除模板package.json中不必要的配置字段: scaffoldConfig、gitHead等
   */
  updatePackageConfig(): void {
    const { user = {} } = gitInfo();
    const { name: author, email } = user;
    const { version, description } = this.answers;

    updateFile(this.context, {
      author,
      email,
      name: this.outdir,
      version,
      description,
      scaffoldConfig: null,
      gitHead: null,
    });
  }

  async run(): Promise<void> {
    await this.downloadScaffold();
    await this.generateReadme();

    await this.gitInitialization();

    this.updatePackageConfig();
  }
}
