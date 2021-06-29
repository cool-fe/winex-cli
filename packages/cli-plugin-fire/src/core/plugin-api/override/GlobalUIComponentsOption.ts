/**
 * Module dependencies.
 */

import Option from '../abstract/Option';

/**
 * globalUIComponents option.
 */

export default class GlobalUIComponentsOption extends Option {
  //@ts-ignore
  async apply(ctx: any) {
    await ctx.writeTemp(
      `internal/global-ui.js`,
      `export default ${JSON.stringify(this.values, null, 2)}`
    );
  }
}
