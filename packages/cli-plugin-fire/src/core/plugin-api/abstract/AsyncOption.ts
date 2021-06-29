/**
 * Module dependencies.
 */

import Option from './Option';

import { logger, chalk, datatypes } from '../../../shared-utils';

const { isFunction } = datatypes;

/**
 * Expose asynchronous option class.
 */

class AsyncOption extends Option {
  /**
   * Asynchronous serial running
   *
   * @param args
   * @param {Array<AsyncFunction>} args
   * @api public
   */

  async asyncApply(...args: any[]) {
    const rawItems = this.items;
    this.items = [];
    this.appliedItems = this.items;

    // eslint-disable-next-line no-restricted-syntax
    for (const { name, value } of rawItems) {
      try {
        this.add(name, isFunction(value) ? await value(...args) : value);
      } catch (error) {
        logger.error(`${chalk.cyan(name)} apply ${chalk.cyan(this.key)} failed.`);
        throw error;
      }
    }

    this.items = rawItems;
  }

  /**
   * Asynchronous serial running
   *
   * @param args
   * @param {Array<AsyncFunction>} args
   * @api public
   */

  async parallelApply(...args: any[]) {
    const rawItems = this.items;
    this.items = [];
    this.appliedItems = this.items;

    await Promise.all(
      rawItems.map(async ({ name, value }) => {
        try {
          this.add(name, isFunction(value) ? await value(...args) : value);
        } catch (error) {
          logger.error(`${chalk.cyan(name)} apply ${chalk.cyan(this.key)} failed.`);
          throw error;
        }
      })
    ).catch((error) => {
      throw error;
    });

    this.items = rawItems;
  }

  /**
   * Process a value via a pipeline.
   *
   * @param input
   * @returns {any}
   * @api public
   */

  async pipeline(input: any) {
    // eslint-disable-next-line no-restricted-syntax
    for (const fn of this.values) {
      // eslint-disable-next-line no-param-reassign
      input = await fn(input);
    }
    return input;
  }
}

AsyncOption.prototype.apply = AsyncOption.prototype.asyncApply;
export default AsyncOption;
