/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-var-requires */
/**
 * Normalize head tag config.
 *
 * @param {string|array} tag
 * @returns {object}
 */

export const normalizeHeadTag = function (tag: any[]) {
  if (typeof tag === 'string') {
    tag = [tag];
  }
  const tagName = tag[0];
  return {
    tagName,
    attributes: tag[1] || {},
    innerHTML: tag[2] || '',
    closeTag: !(tagName === 'meta' || tagName === 'link')
  };
};

/**
 * Use webpack-merge to merge user's config into default config.
 *
 * @param {object} userConfig
 * @param {object} config
 * @param {boolean} isServer
 * @returns {object}
 */

export const applyUserWebpackConfig = function (
  userConfig: any,
  config: any,
  isServer: boolean
): any {
  const merge = require('webpack-merge');
  if (typeof userConfig === 'object') {
    return merge(config, userConfig);
  }
  if (typeof userConfig === 'function') {
    const res = userConfig(config, isServer);
    if (res && typeof res === 'object') {
      return merge(config, res);
    }
  }
  return config;
};

/**
 * Infer date.
 *
 * @param {object} frontmatter
 * @param {string} filename
 * @returns {null|string}
 */

export const DATE_RE = /(\d{4}-\d{1,2}(-\d{1,2})?)-(.*)/;

export const inferDate = function (filename, dirname) {
  let matches;

  // eslint-disable-next-line no-cond-assign
  if (filename && (matches = filename.match(DATE_RE))) {
    return matches[1];
    // eslint-disable-next-line no-cond-assign
  } else if (dirname && (matches = dirname.match(DATE_RE))) {
    return matches[1];
  } else {
    return null;
  }
};
