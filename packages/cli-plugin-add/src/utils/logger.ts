import chalk from "chalk";

exports.warn = (msg: string): void => {
  console.warn(chalk.bgYellow.black(' WARN '), chalk.yellow(msg));
}

exports.error = (msg: string): void => {
  console.error(chalk.bgRed(' ERROR '), chalk.red(msg));
}
