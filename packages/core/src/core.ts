import mri from "mri";

import {
  IOptions,
  ICommandHooksCore,
  ICoreInstance,
  ICommands,
  IHooks,
} from "./interface/commandHookCore";
import { IPluginInstance, ICommandInstance } from "./interface/plugin";

import { loadNpm } from "./npm";
import GetMap from "./errorMap";
import Command from "./commands";

import {
  getMriOptions,
  camelcaseOptionName,
  setDotProp,
  setByType,
} from "./utils/index";

const RegProviderNpm = /^npm:([\w]*):(.*)$/i; // npm providerName pkgName
const RegProviderLocal = /^local:([\w]*):(.*)$/i; // local providerName pkgPath

interface ParsedArgv {
  args: ReadonlyArray<string>;
  options: {
    [k: string]: any;
  };
}

export class CommandHookCore implements ICommandHooksCore {
  options: IOptions;
  private instances: IPluginInstance[] = [];
  private commands: ICommands = {};
  private hooks: IHooks = {};
  private coreInstance: ICoreInstance;
  private npmPlugin: string[] = [];
  private loadNpm: any;
  private preDebugTime: any;
  private execId: number = Math.ceil(Math.random() * 1000);

  store = new Map();

  constructor(options: IOptions) {
    this.options = options || {};
    // options是命令行输入的参数
    if (!this.options.options) {
      this.options.options = [];
    }
    this.loadNpm = loadNpm.bind(null, this);
    /**
     * cli-core实例,可以通过实例上的方法执行内核相关方法
     * 例如start方法用于启动脚手架
     */
    this.coreInstance = this.getCoreInstance();
  }

  // 添加插件
  public addPlugin(Plugin: any) {
    const coreInstance: ICoreInstance = this.coreInstance;
    // 支持加载npm 或 本地插件（绝对地址）
    if (typeof Plugin === "string") {
      if (RegProviderNpm.test(Plugin)) {
        const npmProviderMatch: any = RegProviderNpm.exec(Plugin);
        this.npmPlugin.push(npmProviderMatch[2]);
      } else if (RegProviderLocal.test(Plugin)) {
        const localProviderMatch: any = RegProviderLocal.exec(Plugin);
        this.loadLocalPlugin(localProviderMatch[2]);
      } else {
        this.error("pluginType", Plugin);
      }
      return;
    }
    // 非class不加载
    if (typeof Plugin !== "function") {
      return;
    }

    const instance = new Plugin(coreInstance, this.options.options); //插件实例对象

    // 避免多次加载
    if (this.instances.length) {
      for (const plugin of this.instances) {
        if (plugin instanceof Plugin) {
          return;
        }
      }
    }
    this.loadCommands(instance, this.commands, instance.commands); //加载插件内部的commands
    this.loadHooks(instance.hooks);
    this.instances.push(instance);
  }

  // 调用某命令
  // -  commandsArray 为多级命令，如 [invoke, local] 则执行 invoke的二级子命令 local
  // -  allowEntryPoints 为是否可以调用 entryPoints
  // -  options 调用参数

  public async invoke(
    commandsArray?: string[],
    allowEntryPoints?: boolean,
    options?: any
  ) {
    if (commandsArray == null) {
      // 把用户输入的命令赋值
      commandsArray = this.options.commands;
    }
    if (!Array.isArray(commandsArray)) {
      commandsArray = [].concat(commandsArray || []);
    }
    if (options) {
      // 动态合并参数
      Object.assign(this.options.options, options);
    }

    const displayHelp =
      mri(this.options.options).h || mri(this.options.options).help;

    if (!commandsArray.length && displayHelp) {
      return this.displayHelp();
    }

    if (!commandsArray.length) return;
    const commandInfo = this.getCommand(commandsArray, allowEntryPoints);

    // 处理默认值的问题
    commandInfo.parsedOptions = this.mri(
      this.options.options,
      commandInfo.command
    );

    // 校验参数值
    commandInfo.command.checkOptionValue();

    const lifecycleEvents = this.loadLifecycle(
      commandInfo.commandName,
      commandInfo.command.lifecycleEvents,
      commandInfo.parentCommandList
    );

    if (this.options.point) {
      this.options.point("invoke", commandsArray, commandInfo, this);
    }

    // 展示帮助
    if (displayHelp) {
      return this.displayHelp(commandsArray);
    }

    for (const lifecycle of lifecycleEvents) {
      this.debug("Core Lifecycle", lifecycle);
      const hooks = this.hooks[lifecycle] || [];
      for (const hook of hooks) {
        try {
          await hook.call(commandInfo, commandInfo);
        } catch (e) {
          this.debug("Core Lifecycle Hook Error");
          console.log(e);
          throw e;
        }
      }
    }
  }

  public async ready() {
    await this.loadNpmPlugins();
    await this.asyncInit();
  }

  // 获取核心instance
  private getCoreInstance(): ICoreInstance {
    const { commands } = this.options;
    return {
      classes: {
        Error,
      },
      store: this.store,
      cli: this.getLog(),
      // 调用某命令
      invoke: this.invoke.bind(this),
      //调用某命令
      spawn: this.spawn.bind(this),
      debug: this.debug.bind(this),

      // 保存执行命令过程option和command
      processedInput: {
        options: {},
        commands: commands || [],
      },
      // core内部插件管理类,主要做插件的增删改查操作
      pluginManager: this,
    };
  }

  // 加载命令,支持子命令
  private loadCommands(
    instance: any,
    commandsMap: any,
    commands: any,
    parentCommandList?: string[]
  ) {
    if (!commands) {
      return;
    }
    Object.keys(commands).forEach((command: string) => {
      const commandInstance: ICommandInstance = commands[command];

      if (!commandsMap[command]) {
        commandsMap[command] = new Command({
          description: commandInstance.usage,
          type: commandInstance.type || "command",
          lifecycleEvents: [],
          options: [],
          origin: [],
          commands: {},
          config: commandInstance.config,
          cliArgs: this.options?.options,
        });
      }

      // 当前命令的command实例对象
      const currentCommand = commandsMap[command];
      //把当前插件的命令对象添加到command实例的origin
      currentCommand.addOrigin(commandInstance);

      // 对当前的命令options做处理
      for (const option in commandInstance.options) {
        if (
          Object.prototype.hasOwnProperty.call(commandInstance.options, option)
        ) {
          const { usage, shortcut, config = {} } = commandInstance.options[
            option
          ];
          currentCommand.option(option, usage, shortcut, config);
        }
      }

      /**
       * 处理命令 [create,sao] 主要是加载子命令
       */
      if (commandInstance.commands) {
        this.loadCommands(
          instance,
          currentCommand.commands,
          commandInstance.commands,
          (parentCommandList || []).concat(command)
        );
      }
    });
  }

  // 加载hooks
  private loadHooks(hooks: any) {
    if (!hooks) {
      return;
    }
    for (const hookName in hooks) {
      if (!this.hooks[hookName]) {
        this.hooks[hookName] = [];
      }
      this.hooks[hookName].push(hooks[hookName]);
    }
  }

  private loadLifecycle(
    command: string,
    lifecycleEvents: string[] | undefined,
    parentCommandList?: string[]
  ) {
    const allLifecycles: string[] = [];
    const { stopLifecycle } = this.options;
    const parentCommand =
      parentCommandList && parentCommandList.length
        ? `${parentCommandList.join(":")}:`
        : "";
    if (lifecycleEvents) {
      for (const life of lifecycleEvents) {
        const tmpLife = `${parentCommand}${command}:${life}`;
        allLifecycles.push(`before:${tmpLife}`);
        allLifecycles.push(tmpLife);
        allLifecycles.push(`after:${tmpLife}`);
        if (stopLifecycle === tmpLife) {
          return allLifecycles;
        }
      }
    }
    return allLifecycles;
  }

  private getCommand(commandsArray: string[], allowEntryPoints?: boolean): any {
    let command: string | undefined = "";
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let cmdObj: any = this;
    const commandPath: string[] = [];
    const parentCommandList: string[] = [];
    const usage = {};
    for (command of commandsArray) {
      if (commandPath.length) {
        parentCommandList.push(commandPath[commandPath.length - 1]);
      }
      commandPath.push(command);
      if (!cmdObj || !cmdObj.commands || !cmdObj.commands[command]) {
        this.error("commandNotFound", { command, commandPath });
      }
      cmdObj = cmdObj.commands[command];
    }
    if (!cmdObj) {
      this.error("commandNotFound", { command, commandPath });
    }
    if (cmdObj.type === "entrypoint" && !allowEntryPoints) {
      this.error("commandIsEntrypoint", { command, commandPath });
    }

    return {
      commandName: command,
      command: cmdObj,
      usage,
      parentCommandList,
    };
  }

  // 加载npm包插件
  private async loadNpmPlugins() {
    for (const npmPath of this.npmPlugin) {
      await this.loadNpm(npmPath, this.options.pm);
    }
  }

  // 加载本地插件
  private async loadLocalPlugin(localPath: string) {
    try {
      this.debug("Core Local Plugin", localPath);
      let plugin = require(localPath);
      if (typeof plugin === "object") {
        plugin = plugin[Object.keys(plugin)[0]];
      }
      this.addPlugin(plugin);
    } catch (e) {
      this.error("localPlugin", { path: localPath, err: e });
    }
  }

  // 插件的异步初始化
  private async asyncInit() {
    for (const instance of this.instances) {
      if (instance.asyncInit) {
        await instance.asyncInit();
      }
    }
  }

  private displayHelp(commandsArray?: string[] | undefined) {
    if (this.options.displayUsage) {
      this.options.displayUsage(commandsArray || [], this);
    }
  }

  private getLog() {
    return this.options.log || console;
  }

  error<T>(type: string, info?: T) {
    const errObj: {
      info?: T;
      message: string;
    } = GetMap(type, info);

    const { cli } = this.coreInstance;
    if (cli && cli.error) {
      cli.error(errObj);
    } else {
      throw new Error(errObj.message);
    }
  }

  debug(...args: string[]) {
    const { V, verbose } = mri(this.options.options);
    if (!(V || verbose)) {
      return;
    }

    const now = Date.now();
    if (!this.preDebugTime) {
      this.preDebugTime = now;
    }
    const { type, path, line } = this.getStackTrace();
    let stack = "";
    if (type) {
      if (typeof verbose === "string" && type !== verbose) {
        return;
      }
      stack = `(${type}:${path}:${line})`;
    }
    const diffTime = Number((now - this.preDebugTime) / 1000).toFixed(2);
    this.preDebugTime = now;
    this.getLog().log(
      "[Verbose]",
      this.execId,
      `+${diffTime}s`,
      ...args,
      stack
    );
  }

  getStackTrace() {
    if (!Error.captureStackTrace) {
      return {};
    }
    const obj: any = {};
    Error.captureStackTrace(obj, this.getStackTrace);
    if (!obj.stack || !obj.stack.split) {
      return {};
    }
    const stackStr = obj.stack.split("\n");
    if (!stackStr || !stackStr[2]) {
      return {};
    }
    const matchReg = /(?:-plugin-|\/faas-cli-command-)(\w+)\/(.*?):(\d+):\d+/;
    if (!matchReg.test(stackStr[2])) {
      return {};
    }
    const matchResult = matchReg.exec(stackStr[2]);
    return {
      type: matchResult && matchResult[1],
      path: matchResult && matchResult[2],
      line: matchResult && matchResult[3],
    };
  }

  private mri(
    argv: string[],
    /** Matched command */ command?: Command
  ): ParsedArgv {
    // All added options
    const cliOptions = [...(command ? command.options : [])];
    const mriOptions = getMriOptions(cliOptions);

    // Extract everything after `--` since mri doesn't support it
    let argsAfterDoubleDashes: string[] = [];
    const doubleDashesIndex = argv.indexOf("--");
    if (doubleDashesIndex > -1) {
      argsAfterDoubleDashes = argv.slice(doubleDashesIndex + 1);
      argv = argv.slice(0, doubleDashesIndex);
    }

    let parsed = mri(argv, mriOptions);
    parsed = Object.keys(parsed).reduce(
      (res, name) => {
        return {
          ...res,
          [camelcaseOptionName(name)]: parsed[name],
        };
      },
      { _: [] }
    );

    const args = parsed._;

    const options: { [k: string]: any } = {
      "--": argsAfterDoubleDashes,
    };

    // Set option default value
    const ignoreDefault =
      command && command.config.ignoreOptionDefaultValue
        ? command.config.ignoreOptionDefaultValue
        : false;

    let transforms = Object.create(null);

    for (const cliOption of cliOptions) {
      if (!ignoreDefault && cliOption.config.default !== undefined) {
        for (const name of cliOption.names) {
          options[name] = cliOption.config.default;
        }
      }

      // If options type is defined
      if (Array.isArray(cliOption.config.type)) {
        if (transforms[cliOption.name] === undefined) {
          transforms[cliOption.name] = Object.create(null);

          transforms[cliOption.name]["shouldTransform"] = true;
          transforms[cliOption.name]["transformFunction"] =
            cliOption.config.type[0];
        }
      }
    }

    // Set option values (support dot-nested property name)
    for (const key of Object.keys(parsed)) {
      if (key !== "_") {
        const keys = key.split(".");
        setDotProp(options, keys, parsed[key]);
        setByType(options, transforms);
      }
    }

    return {
      args,
      options,
    };
  }
}
