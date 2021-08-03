/* eslint-disable @typescript-eslint/no-var-requires */

const { execSync } = require('child_process');
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: 'https://40872dc20e484cb09d42dc20703311ea@o878996.ingest.sentry.io/5831301',
  tracesSampleRate: 1.0
});

Sentry.configureScope((scope) => {
  const os = require('os');
  const path = require('path');
  const fs = require('fs');
  const ini = require('ini');
  const nodeVersion = execSync('node -v').toString().replace('\n', '');
  const cliVersion = require('../package.json').version;
  scope.setTag('level', 'info');
  scope.setTag('os platform', os.platform());
  scope.setTag('os arch', os.arch());
  scope.setTag('os release', os.release());
  scope.setTag('node', 'Node.js'.padEnd(20) + nodeVersion);
  scope.setTag('cli-version', `${'@winfe/winex-cli'.padEnd(20)}v${cliVersion}`);
  const filePath = path.join(os.homedir(), '.gitconfig');
  if (fs.existsSync(filePath)) {
    const { user = {} } = ini.parse(fs.readFileSync(filePath, 'utf8'));
    scope.setTag('git-name', user.username || user.name);
    scope.setTag('git-name', user.email);
  }
});

Sentry.captureMessage('[WINEX CLI](install)');
