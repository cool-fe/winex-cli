/**
 * @fileoverview Handle logging for cli-plugin-lint
 * @author dashixiong
 */

const Logger = {
  /**
   * Cover for console.log
   * @param {...any} args The elements to log.
   * @returns {void}
   */
  info(...args: any[]): void {
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
  error(...args: any[]): void {
    console.error(...args);
  }
};

export default Logger;
