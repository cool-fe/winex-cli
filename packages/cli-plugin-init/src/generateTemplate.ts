import chalk from 'chalk';
import {
  writeFileTree,
  loadRemotePreset,
  updateFile,
  gitInfo,
  pathExists,
  genNpmInfo
} from './utils/index';
import { ICommandOptions, IAnswers } from './interface/index';

const execa = require('execa');

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
   * 下载预设项目模板
   */
  async downloadScaffold(): Promise<void> {
    const { name, version } = genNpmInfo(this.scaffoldNpmName);
    const { registry } = this.options;

    const result = await loadRemotePreset({ name, version, registry }, this.context);

    if (result) {
      this.core.cli.log(`\n✨  Creating project in ${chalk.yellow(this.context)}`);
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
    this.core.cli.log('\n📄  Generating README.md...');
    const { packageManager } = this.options;

    await writeFileTree(this.context, {
      'README.md': [
        `# ${this.outdir}\n`,
        '## Project setup',
        '```',
        `${packageManager} install`,
        '```'
      ].join('\n')
    });
  }

  runCommand(command: string, args?: string[]) {
    if (!args) {
      // eslint-disable-next-line no-param-reassign
      [command, ...args] = command.split(/\s+/);
    }

    return execa(command, args, {
      cwd: this.context
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
      this.core.cli.log('🗃   Initializing and setting git repository...');

      await this.runCommand('git init');

      await this.runCommand('git', ['remote', 'add', 'origin', repository]);
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
    const { version = '0.0.1', description = 'A project created by winex-cli' } = this.answers;
    const params = {
      author,
      email,
      name: this.options.name,
      version,
      description,
      scaffoldConfig: null,
      componentConfig: null,
      blockConfig: null,
      gitHead: null
    };
    let materialConfigValue;
    try {
      materialConfigValue = JSON.parse(this.options.configValue);
      params[this.options.configKey] = materialConfigValue;
    } catch (error) {
      this.core.cli.log(error);
    }
    updateFile(this.context, params);
  }

  async run(): Promise<void> {
    await this.downloadScaffold();
    await this.generateReadme();

    await this.gitInitialization();

    this.updatePackageConfig();
  }
}
