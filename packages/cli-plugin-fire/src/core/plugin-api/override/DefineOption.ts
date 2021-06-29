/**
 * Module dependencies.
 */

import Option from '../abstract/Option';

/**
 * define option.
 */

export default class DefineOption extends Option {
  //@ts-ignore
  apply(config) {
    super.syncApply();
    const defines = this.appliedValues;
    defines.forEach((define: { [x: string]: any }) => {
      Object.keys(define).forEach((key) => {
        define[key] = JSON.stringify(define[key]);
      });
      //@ts-ignore
      config.plugin('injections').tap(([options]) => [Object.assign(options, define)]);
    });
  }
}
