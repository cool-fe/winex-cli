import readline from 'readline';

/**
 * 清空控制台
 */
export const clearConsole = () => {
  if (process.stdout.isTTY) {
    const blank = "\n".repeat(process.stdout.rows);
    console.log(blank);

    readline.cursorTo(process.stdout, 0, 0);
    readline.clearScreenDown(process.stdout);
  }
};
