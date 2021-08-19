/* eslint-disable @typescript-eslint/ban-ts-comment */
/**
 * irequire
 */

import Enquirer from 'enquirer';

type promptAnwser = {
  [key: string]: string | boolean;
};

interface BasePromptOptions {
  skip?: ((state: any) => boolean | Promise<boolean>) | boolean;
  stdin?: NodeJS.ReadStream;
  stdout?: NodeJS.WriteStream;
  name: string | (() => string);
  type: string | (() => string);
  message: string | (() => string) | (() => Promise<string>);
  initial?: any;
  required?: boolean;
  format?(value: string): string | Promise<string>;
  result?(value: string): string | Promise<string>;
  validate?(value: string): boolean | Promise<boolean> | string | Promise<string>;
  onSubmit?(name: string, value: any, prompt: Enquirer.Prompt): boolean | Promise<boolean>;
  onCancel?(name: string, value: any, prompt: Enquirer.Prompt): boolean | Promise<boolean>;
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
    | 'autocomplete'
    | 'editable'
    | 'form'
    | 'multiselect'
    | 'select'
    | 'survey'
    | 'list'
    | 'scale';
  choices: string[] | Choice[];
  maxChoices?: number;
  muliple?: boolean;
  initial?: number;
  delay?: number;
  separator?: boolean;
  sort?: boolean;
  linebreak?: boolean;
  edgeLength?: number;
  align?: 'left' | 'right';
  scroll?: boolean;
}

interface BooleanPromptOptions extends BasePromptOptions {
  type: 'confirm';
  initial?: boolean;
}

interface StringPromptOptions extends BasePromptOptions {
  type: 'input' | 'invisible' | 'list' | 'password' | 'text';
  initial?: string;
  multiline?: boolean;
}

interface NumberPromptOptions extends BasePromptOptions {
  type: 'numeral';
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
  type: 'snippet';
  newline?: string;
  template?: string;
}

interface SortPromptOptions extends BasePromptOptions {
  type: 'sort';
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

export const runPrompts = async function <T>(prompts: PromptOptions | PromptOptions[]): Promise<T> {
  const enquirer = new Enquirer<T>();
  return enquirer.prompt(prompts);
};
