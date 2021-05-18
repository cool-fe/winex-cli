/**
 * @fileoverview Handle logging for cli-plugin-lint
 * @author dashixiong
 */

export const Logger = {
  /**
   * Cover for console.log
   * @param {...any} args The elements to log.
   * @returns {void}
   */
  info(...args: any[]) {
    console.log(...args);
  },
  debug(...args: any[]) {
    console.log(...args);
  },
  /**
   * Cover for console.error
   * @param {...any} args The elements to log.
   * @returns {void}
   */
  error(...args: any[]) {
    console.error(...args);
  },
};
