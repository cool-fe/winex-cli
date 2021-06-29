/**
 * Module dependencies.
 */

import Option from '../abstract/Option';

/**
 * alias option.
 */

export default class AliasOption extends Option {
  //@ts-ignore
  apply(config) {
    super.syncApply();
    const aliases = this.appliedValues;
    aliases.forEach((alias) => {
      Object.keys(alias).forEach((key) => {
        config.resolve.alias.set(key, alias[key]);
      });
    });
  }
}
