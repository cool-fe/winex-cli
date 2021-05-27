import path from "path";
import chalk from "chalk";

import { BasePlugin } from "@winfe/cli-core";
import { IAnswers, ICommandOptions } from "./interface/index";

import commands from "./commands";
import { PackageManager } from "./packageManager";
import { GenerateTemplate } from "./generateTemplate";
import { runPrompts, commonPrompts } from "./prompts/project";
import { pathExists, clearConsole, checkPakcageName } from "./utils/index";

export default class InitPlugin extends BasePlugin {
  scaffoldNpmName: string = "";
  outdir: string = "";
  context: string = "/";
  answers: IAnswers | any;
  options: ICommandOptions | any;

  commands = commands;

  hooks = {
    "before:init:init": this.beforeInit.bind(this),
    "init:init": this.init.bind(this),
  };

  /**
   * 初始化项目
   * --------------------
   * 该函数主要做好项目模板的下载与git的初始化工作
   */
  async initProject(): Promise<void> {
    const genTemplate = new GenerateTemplate(
      this.core,
      this.answers,
      this.options,
      this.context,
      this.outdir,
      this.scaffoldNpmName
    );

    await genTemplate.run();
  }

  async installingDependencies(): Promise<void> {
    this.core.cli.log("📦  Installing additional dependencies...\n");

    const { packageManager } = this.options;

    const pm = new PackageManager(
      this.context,
      packageManager,
      this.options.registry
    );

    await pm.install();
  }

  /**
   * 开始询问初始化问题
   */
  async runIntegralPrompts(): Promise<void> {
    const answers = await runPrompts();

    if (!answers) return;

    const { template } = answers;

    this.answers = answers;
    this.scaffoldNpmName = template;
  }

  /**
   * 完成模板选择后公共的问询
   * @param scaffold 指定的模板npm name
   */
  async runCommonPrompts(scaffold: string): Promise<void> {
    const answers = await commonPrompts();

    this.answers = answers;
    this.scaffoldNpmName = scaffold;
  }

  checkTargetDir(context: string): boolean {
    return !pathExists(context);
  }

  /**
   * 显示开始提示语
   */
  displayGetStarted() {
    const { packageManager } = this.options;

    this.core.cli.log(
      `\n🎉  Successfully created project ${chalk.yellow(this.outdir)}.` +
        "\n👉  Get started with the following commands:\n\n" +
        `${chalk.cyan(
          `${chalk.gray("$")} cd ${this.outdir}\n${chalk.gray("$")} ${
            packageManager === "yarn" ? "yarn serve" : "npm run serve"
          }\n`
        )}`
    );
  }

  /**
   * init指令之前的hook
   * @param content 命令行输入的参数信息
   */
  beforeInit(content: any) {
    const { options = {} } = content.parsedOptions;

    this.setContext(options);

    const validDir = this.checkTargetDir(this.context);

    if (!validDir) {
      this.core.cli.log(
        `${chalk.red(`✖  Target directory ${options.name} already exists.`)}`
      );
      process.exit(1);
    }

    // set outdir and options
    this.outdir = options.name;
    this.options = options;
  }

  /**
   * 设置目标上下文路径
   * @param options 命令行解析的参数信息
   */
  setContext(options: ICommandOptions) {
    this.context = path.resolve(options.path || process.cwd(), options.name);
  }

  /**
   * 初始化模板hook回调
   */
  async init() {
    clearConsole();

    // specify template
    if (this.options["template"]) {
      const SPECIFIED_SCAFFOLD = this.options["template"];

      const validPkg = await checkPakcageName(SPECIFIED_SCAFFOLD);

      if (!validPkg) {
        this.core.cli.log(
          `${chalk.red(`✖  Invalid scaffold name: ${SPECIFIED_SCAFFOLD}`)}`
        );
        return;
      }

      this.core.cli.log(
        `${chalk.green("✔")} Specified scaffold · ${chalk.cyan(
          SPECIFIED_SCAFFOLD
        )}`
      );

      await this.runCommonPrompts(SPECIFIED_SCAFFOLD);
      await this.initProject();
    } else {
      await this.runIntegralPrompts();
      await this.initProject();
    }

    await this.installingDependencies();

    this.displayGetStarted();
  }
}
