import { findLongest, padRight, TRNError } from "./utils/index";

import Option from "./option";
import { ICommandInstance } from "./interface/plugin";
import mri from "mri";

interface HelpSection {
  title?: string;
  body: string;
}

interface CommandConsArgu {
  description: string | undefined;
  type?: string;
  name:string;
  lifecycleEvents?: string[];
  usage?: string;
  config?:
    | {
        [key: string]: string | boolean;
      }
    | undefined;
  options?: {
    [option: string]: {
      usage: string;
      shortcut?: string;
    };
  }[];
  origin: any[];
  commands?: {
    [command: string]: ICommandInstance;
  };
  cliArgs: string[];
}

type HelpCallback = (sections: HelpSection[]) => void | HelpSection[];

class Command {
  options: any[];
  /* Parsed command name */
  name: string;
  config: {
    [key: string]: string | boolean;
  };
  origin: any[];
  lifecycleEvents: string[];
  commandAction?: (...args: any[]) => any;
  usageText?: string;
  versionNumber?: string;
  helpCallback?: HelpCallback;
  cliArgs: string[];
  commands?: ICommandInstance;

  constructor(argument: CommandConsArgu) {
    const {
      config = {},
      description,
      origin = [],
      lifecycleEvents = [],
      cliArgs,
      commands,
      name
    } = argument;
    this.options = [];
    this.config = config;
    this.origin = origin;
    this.lifecycleEvents = lifecycleEvents;
    this.usageText = description;
    this.cliArgs = [...cliArgs];
    this.commands = commands;
    this.name = name
  }

  usage(text: string) {
    this.usageText = text;
    return this;
  }

  SetLifecycleEvents(lifecycleEvents: any) {
    this.lifecycleEvents = lifecycleEvents;
    return this;
  }

  addOrigin(commandInstance: any) {
    this.origin.push(commandInstance);
  }

  version(version: string, customFlags = "-v, --version") {
    this.versionNumber = version;
    this.option(customFlags, "Display version number");
    return this;
  }

  /**
   * Add a option for this command
   * @param rawName Raw option name(s)
   * @param description Option description
   * @param config Option config
   */
  option(
    rawName: string,
    description: string,
    shortcut?: string,
    config?: any
  ) {
    const option = new Option(rawName, description, shortcut, config);
    this.options.push(option);
    return this;
  }

  /**
   * Check if an option is registered in this command
   * @param name Option name
   */
  hasOption(name: string) {
    name = name.split(".")[0];
    return this.options.find((option) => {
      return option.names.includes(name);
    });
  }

  outputHelp() {
    const { name } = this;
    let sections: HelpSection[] = [];

    sections.push({
      title: "\n\nCommand",
      body: `  $ ${name}     ${this.usageText || this.name}`,
    });

    const options = this.options;
    if (options.length > 0) {
      const longestOptionName = findLongest(
        options.map((option) => option.rawName)
      );
      sections.push({
        title: "Options",
        body: options
          .map((option) => {
            return `  ${padRight(option.rawName, longestOptionName.length)}  ${
              option.description
            } ${
              option.config.default === undefined
                ? ""
                : `(default: ${option.config.default})`
            }`;
          })
          .join("\n"),
      });
    }

    console.log(
      sections
        .map((section) => {
          return section.title
            ? `${section.title}:\n${section.body}`
            : section.body;
        })
        .join("\n\n")
    );
  }

  /**
   * Check if the required string-type options exist
   */
  checkOptionValue() {
    const { cliArgs } = this;
    const parsedOptions = mri(cliArgs);
    const options = [...this.options];
    for (const option of options) {
      const value = parsedOptions[option.name.split(".")[0]];
      // Check required option value
      if (option.required) {
        const hasNegated = options.some(
          (o) => o.negated && o.names.includes(option.name)
        );
        if (value === true || (value === undefined && !hasNegated)) {
          throw new TRNError(`option \`${option.rawName}\` value is missing`);
        }
      }
    }
  }
}

export default Command;
