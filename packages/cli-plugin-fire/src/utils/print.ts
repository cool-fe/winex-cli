import chalk from 'chalk';

export function printErrorAndExit(message: string): void {
  console.error(chalk.red(message));
  process.exit(1);
}

export function logStep(name: string): void {
  console.log(`${chalk.gray('>> Release:')} ${chalk.magenta.bold(name)}`);
}
