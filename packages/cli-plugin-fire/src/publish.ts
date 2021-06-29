import chalk from 'chalk';
import path from 'path';
import spawn from 'cross-spawn';

const error = chalk.bold.red;
const info = chalk.bold.green;

// admin:devops@2019
const NEXUS_TOKEN = 'YWRtaW46ZGV2b3BzQDIwMTk=';

export default async (): Promise<void> => {
  info('start...');

  const { name: packageName } = require(path.resolve(process.cwd(), './package.json'));
  const { command } = require(path.resolve(process.cwd(), './lerna.json'));

  const argvs = [
    'publish',
    '--legacy-auth',
    NEXUS_TOKEN,
    '--registry',
    'http://172.16.9.242:8081/repository/npm-local/'
  ];

  if (process.env.npm_config_ci && process.env.npm_config_ci.length) argvs.push('--yes');

  //符合semver语义的版本
  const semantic = ['major', 'minor', 'patch', 'premajor', 'preminor', 'prepatch', 'prerelease'];

  // 自定义preid
  /**
   * ["--preid" "beta"]
   */

  // 稳定版发测试版
  /**
   * ["--conventional-prerelease","--preid" "beta"]
   */

  // 测试版发稳定版
  /**
   * ["--conventional-graduate"]
   */

  if (command.publish && command.publish.version) {
    if (typeof command.publish.version === 'string' && semantic.includes(command.publish.version)) {
      argvs.push(...['--bump', command.publish.version]);
    } else if (command.publish.version instanceof Array) {
      argvs.push(...command.publish.version);
    }
  }

  try {
    const ps = spawn(path.resolve(process.cwd(), 'node_modules/.bin/lerna'), argvs, {
      stdio: 'inherit',
      cwd: process.cwd(),
      env: {
        FORCE_COLOR: 'true',
        npm_config_color: 'always',
        npm_config_progress: 'true',
        // eslint-disable-next-line node/no-unsupported-features/es-syntax
        ...process.env
      }
    });

    ps.on('error', () => {
      throw new Error(`Failed to install ${packageName}\n${ps.stderr}`);
    });

    ps.on('close', () => {
      error(`Installed ${packageName}`);
    });
  } catch (err) {
    error(`Failed to install ${err}`);
    process.exit(1);
  }
};
