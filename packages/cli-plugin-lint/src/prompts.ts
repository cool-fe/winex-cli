/**
 * irequire
 */

import Enquirer from "enquirer";
import type { PluginOptions } from "./index";

type promptAnwser = {
  [key: string]: string | boolean;
};

interface BasePromptOptions {
  name: string | (() => string);
  type: string | (() => string);
  message: string | (() => string) | (() => Promise<string>);
  initial?: any;
  required?: boolean;
  format?(value: string): string | Promise<string>;
  result?(value: string): string | Promise<string>;
  skip?: ((state: object) => boolean | Promise<boolean>) | boolean;
  validate?(
    value: string
  ): boolean | Promise<boolean> | string | Promise<string>;
  onSubmit?(
    name: string,
    value: any,
    prompt: Enquirer.Prompt
  ): boolean | Promise<boolean>;
  onCancel?(
    name: string,
    value: any,
    prompt: Enquirer.Prompt
  ): boolean | Promise<boolean>;
  stdin?: NodeJS.ReadStream;
  stdout?: NodeJS.WriteStream;
}

interface Choice {
  name: string;
  message?: string;
  value?: string;
  hint?: string;
  disabled?: boolean | string;
}

interface ArrayPromptOptions extends BasePromptOptions {
  type:
    | "autocomplete"
    | "editable"
    | "form"
    | "multiselect"
    | "select"
    | "survey"
    | "list"
    | "scale";
  choices: string[] | Choice[];
  maxChoices?: number;
  muliple?: boolean;
  initial?: number;
  delay?: number;
  separator?: boolean;
  sort?: boolean;
  linebreak?: boolean;
  edgeLength?: number;
  align?: "left" | "right";
  scroll?: boolean;
}

interface BooleanPromptOptions extends BasePromptOptions {
  type: "confirm";
  initial?: boolean;
}

interface StringPromptOptions extends BasePromptOptions {
  type: "input" | "invisible" | "list" | "password" | "text";
  initial?: string;
  multiline?: boolean;
}

interface NumberPromptOptions extends BasePromptOptions {
  type: "numeral";
  min?: number;
  max?: number;
  delay?: number;
  float?: boolean;
  round?: boolean;
  major?: number;
  minor?: number;
  initial?: number;
}

interface SnippetPromptOptions extends BasePromptOptions {
  type: "snippet";
  newline?: string;
  template?: string;
}

interface SortPromptOptions extends BasePromptOptions {
  type: "sort";
  hint?: string;
  drag?: boolean;
  numbered?: boolean;
}

type PromptOptions =
  | BasePromptOptions
  | ArrayPromptOptions
  | BooleanPromptOptions
  | StringPromptOptions
  | NumberPromptOptions
  | SnippetPromptOptions
  | SortPromptOptions;

/**
 * The state of current running prompt
 */
export interface PromptState {
  /**
   * Prompt answers
   */
  answers: {
    [k: string]: any;
  };
}

const renderProjectPrompt = function (options: PluginOptions): PromptOptions[] {
  const { env, typescript, pm } = options;
  return [
    {
      name: "pm",
      message: "What type of packmanage does your project use?",
      hint: "(Press <space> to select)",
      choices: [
        { name: "yarn", message: "Yarn" },
        { name: "npm", message: "Npm" },
      ],
      type: "select",
      skip: !!pm,
      initial: 0,
      result(value) {
        return pm ? pm : value;
      },
    },
    {
      type: "select",
      name: "env",
      message: "Where does your code run?",
      hint: "(Press <space> to select)",
      initial: 0,
      choices: [
        { message: "Browser", name: "browser" },
        { message: "Node", name: "node" },
      ],
      skip: !!env,
      result(value) {
        return env ? env : value;
      },
    },
    {
      type: "toggle",
      name: "typescript",
      message: "Does your project use TypeScript?",
      initial: false,
      skip: !!typescript,
      //@ts-ignore
      result(value) {
        return typescript ? typescript : value;
      },
    },
  ];
};

export const runPrompts = async function (
  prompts: PromptOptions | PromptOptions[]
): Promise<promptAnwser> {
  const enquirer = new Enquirer<promptAnwser>();
  const anwser = await enquirer.prompt(prompts);
  return anwser;
};

export const createCliPrompt = async function (
  options: PluginOptions
): Promise<promptAnwser> {
  const prompts = [...renderProjectPrompt(options)];
  return await runPrompts(prompts);
};
