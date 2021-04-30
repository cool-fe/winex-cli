export interface ILog {
  log: (...any: any[]) => void;
  error?: (...any: any[]) => void;
}

export interface IOptions {
  options: string[]; // 参数，会处理后挂在到插件的 options 上
  commands?: string[]; // 命令列表，如 ['invoke']
  log?: ILog;
  displayUsage?: any; // 使用帮助的展示处理
  pm?: string; // 使用何种npm加速
  point?: any; // 埋点   (type: string, commandsArray: string[], commandInfo: any, this);
  stopLifecycle?: string; // 生命周期执行到什么时候终止，例如 invoke:invoke
  disableAutoLoad?: boolean; // 是否禁用自动加载插件
}

export interface ICommandHooksCore {
  addPlugin(plugin: IPlugin): void;
  store: IStore<any>;
  options: any;
}

interface IStore<T> {
  [index: string]: T;
  [index: number]: T;
}

export interface ICoreInstance {
  classes: any;
  cli: ILog | Console;
  invoke(
    commandsArray?: string[],
    allowEntryPoints?: boolean,
    options?: any
  ): any;
  pluginManager: ICommandHooksCore;
  store: IStore<any>;
  debug: any;
  processedInput: {
    options: any;
    commands: string[];
  };
}

export declare class IPlugin {
  constructor(coreInstance: ICoreInstance, options: any);
}

export interface ICommands {
  [command: string]: any;
}

export type IHookFun = (content: any, options?: any) => Promise<void> | void;

export interface IHooks {
  [lifestyle: string]: IHookFun[];
}
