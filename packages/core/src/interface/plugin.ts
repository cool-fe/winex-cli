export interface IPluginInstance {
  commands?: IPluginCommands;
  hooks?: IPluginHooks;
  asyncInit?: () => Promise<any>;
}

export interface ICommandInstance {
  type?: string;
  lifecycleEvents?: string[];
  usage?: string;
  config?: {
    [key: string]: string;
  };
  rank?: number;
  options?: {
    [option: string]: {
      usage: string;
      shortcut?: string;
      config?: {};
    };
  };
  commands?: {
    [command: string]: ICommandInstance;
  };
}

export interface IPluginCommands {
  [command: string]: ICommandInstance;
}

export interface IPluginHooks {
  [hook: string]: (context: any, options?: any) => void | Promise<void>;
}
