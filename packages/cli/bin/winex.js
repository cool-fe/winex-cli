#!/usr/bin/env node
"use strict";

const cliFun = async (argv) => {
  const { CLI } = require("../lib");
  const cli = new CLI(argv);
  cli
    .start()
    .then(() => {
      process.exit();
    })
    .catch((e) => {
      process.exit();
    });
};

const argv = process.argv.slice(2);
cliFun(argv);
