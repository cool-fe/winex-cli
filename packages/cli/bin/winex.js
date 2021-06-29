#!/usr/bin/env node
/* eslint-disable node/shebang */

const cliFun = async (argv) => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { CLI } = require('../lib');
  const cli = new CLI(argv);
  cli
    .start()
    .then(() => {
      // process.exit();
    })
    .catch(() => {
      process.exit();
    });
};

const argv = process.argv.slice(2);
cliFun(argv);
