import chalk from 'chalk';
import { assertTypes } from './datatypes';
import logger from './logger';

export default function normalizeConfig(pluginsConfig: any) {
  const { valid, warnMsg } = assertTypes(pluginsConfig, [Object, Array]);
  if (!valid) {
    if (pluginsConfig !== undefined) {
      logger.warn(`[${chalk.gray('config')}] ` + `Invalid value for "plugin" field : ${warnMsg}`);
    }
    pluginsConfig = [];
    return pluginsConfig;
  }

  if (Array.isArray(pluginsConfig)) {
    pluginsConfig = pluginsConfig.map((item) => (Array.isArray(item) ? item : [item]));
  } else if (typeof pluginsConfig === 'object') {
    pluginsConfig = Object.keys(pluginsConfig).map((item) => [item, pluginsConfig[item]]);
  }
  return pluginsConfig;
}
