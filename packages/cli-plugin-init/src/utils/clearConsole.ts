import readline from 'readline';
import chalk from 'chalk';

const getCLIVersion = () => {
  const localVersion = require(`../../../cli/package.json`).version;

  return localVersion;
};

/**
 * 清空控制台
 */
export const clearConsole = () => {
  if (process.stdout.isTTY) {
    const blank = "\n".repeat(process.stdout.rows);
    console.log(blank);

    readline.cursorTo(process.stdout, 0, 0);
    readline.clearScreenDown(process.stdout);

    const version = getCLIVersion();

    if (version) {
      console.log(chalk.bold.blue(`Winex CLI v${version}\n`));
    }
  }
};
