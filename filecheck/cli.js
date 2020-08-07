#!/usr/bin/env node
const cli = require("caporal");

// const {
//   DATABASE_URL,
//   EXCLUDE_SLUG_PREFIXES,
//   IMPORT_LOCALES,
// } = require("./constants");
const runChecker = require("./checker");

cli
  .version(require("./package.json").version)
  .argument("[files...]", "list of files to check")
  .action((args, options) => {
    return runChecker(args.files, options).catch((error) => {
      console.error("Error while checking files:", error);
      process.exit(1);
    });
  });

cli.parse(process.argv);
