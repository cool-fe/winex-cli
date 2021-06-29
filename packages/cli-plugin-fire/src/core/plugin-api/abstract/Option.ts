/**
 * Module dependencies.
 */

import { logger, chalk, compose, datatypes } from '../../../shared-utils';

const { isFunction } = datatypes;

/**
 * Expose synchronous option class.
 */

class Option {
  key: string;

  items: any[];

  appliedItems: any;

  constructor(key: string) {
    this.key = key;
    this.items = [];
  }

  /**
   * Set value with name.
   *
   * @param {string} name
   * @param {T} value
   * @api public
   */

  add(name: any, value: unknown[]) {
    if (Array.isArray(value)) {
      return this.items.push(...value.map((i) => ({ value: i, name })));
    }
    this.items.push({ value, name });
  }

  /**
   * Delete value with name.
   *
   * @param {string} name
   * @api public
   */

  delete(name: any) {
    let index = this.items.findIndex(({ name: _name }) => _name === name);
    while (index !== -1) {
      this.items.splice(index, 1);
      index = this.items.findIndex(({ name: _name }) => _name === name);
    }
  }

  /**
   * Clean option store
   *
   * @param {string} name
   * @api public
   */

  clear() {
    this.items = [];
  }

  /**
   * Get values.
   *
   * @returns {any<T>}
   * @api public
   */

  get values(): any {
    return this.items.map((item) => item.value);
  }

  /**
   * Get applied values
   *
   * @returns {Array|*|any[]}
   * @api public
   */

  get appliedValues(): any {
    return this.appliedItems && this.appliedItems.map((item: { value: any }) => item.value);
  }

  /**
   * Get entries.
   *
   * @returns {any<T>}
   * @api public
   */

  get entries(): any {
    return this.items.map(({ name, value }) => [name, value]);
  }

  /**
   * Synchronous running
   *
   * @param {Array<Function>} args
   * @api public
   */

  syncApply(...args: any[]) {
    const rawItems = this.items;
    this.items = [];
    this.appliedItems = this.items;

    // eslint-disable-next-line no-restricted-syntax
    for (const { name, value } of rawItems) {
      try {
        this.add(name, isFunction(value) ? value(...args) : value);
      } catch (error) {
        logger.error(`${chalk.cyan(name)} apply ${chalk.cyan(this.key)} failed.`);
        throw error;
      }
    }

    this.items = rawItems;
  }

  /**
   * Process a value via a pipeline.
   * @param input
   * @returns {*}
   */

  pipeline(input: any): any {
    const fn = compose(this.values);
    return fn(input);
  }
}
//@ts-ignore
Option.prototype.apply = Option.prototype.syncApply;
export default Option;
