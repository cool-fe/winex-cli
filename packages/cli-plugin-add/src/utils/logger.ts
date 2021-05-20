import chalk from "chalk";

const warn = (msg: string): void => {
  console.warn(chalk.bgYellow.black(' WARN '), chalk.yellow(msg));
}

const error = (msg: string): void => {
  console.error(chalk.bgRed(' ERROR '), chalk.red(msg));
}

export {
  warn,
  error,
};
