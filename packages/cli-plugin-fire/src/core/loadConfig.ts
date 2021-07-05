/**
 * Module dependencies.
 */

import { path } from '../shared-utils';

/**
 * Expose loadConfig.
 */

export default function loadConfig(sourceDir: string) {
  const configPath = path.resolve(sourceDir, 'winfe.config.js');
  // resolve siteConfig
  const apponfig = require(configPath);
  return apponfig;
}
