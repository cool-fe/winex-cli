/* eslint-disable import/prefer-default-export */
/**
 * Module dependencies.
 */

import { logger, chalk, datatypes } from '../../shared-utils';

const { assertTypes } = datatypes;

/**
 * flatten your plugin config by passing in name, options and context.
 *
 * @param {function|object} module
 * @param {string} name
 * @param {string} hortcut
 * @param {object} pluginOptions
 * @param {object} pluginContext
 */

export const flattenPlugin = function (
  { entry: config, name, shortcut, fromDep }: any,
  pluginOptions: any,
  pluginContext: object | null,
  self: this
) {
  const { valid, warnMsg } = assertTypes(pluginOptions, [Object, Array, Boolean]);
  if (!valid) {
    if (pluginOptions !== undefined) {
      logger.warn(
        `[${chalk.gray(shortcut)}] ` +
          `Invalid value for "pluginOptions" ${chalk.cyan(name)}: ${warnMsg}`
      );
    }
    // eslint-disable-next-line no-param-reassign
    pluginOptions = {};
  }

  let enabled = true;
  if (typeof pluginOptions === 'boolean') {
    enabled = pluginOptions;
    // eslint-disable-next-line no-param-reassign
    pluginOptions = {};
  }

  if (typeof config === 'function') {
    // 'Object.create' here is to give each plugin a separate context,
    // but also own the inheritance context.
    // eslint-disable-next-line no-param-reassign
    config = config(pluginOptions, Object.create(pluginContext), self);
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const { valid, warnMsg } = assertTypes(config, [Object]);
    if (!valid) {
      // eslint-disable-next-line no-useless-concat
      logger.warn(`[${chalk.gray(shortcut)}] ` + `Invalid value for plugin: ${warnMsg}`);
      // eslint-disable-next-line no-param-reassign
      config = {};
    }
  }

  // respect name in local plugin config
  if (!fromDep && config.name) {
    // eslint-disable-next-line no-param-reassign
    name = config.name;
  }

  return {
    ...config,
    name,
    shortcut: fromDep ? shortcut : null,
    enabled,
    $$options: pluginOptions /* used for test */
  };
};
