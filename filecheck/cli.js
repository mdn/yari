#!/usr/bin/env node
const cli = require("caporal");
const path = require("path");

const { runChecker } = require("./checker");

cli
  .version(require("./package.json").version)
  .option("--cwd <path>", "Explicit current-working-directory", cli.PATH)
  .argument("[files...]", "list of files to check")
  .action((args, options) => {
    const cwd = options.cwd || process.cwd();
    const allFilePaths = args.files.map((f) => path.resolve(cwd, f));
    return runChecker(allFilePaths, options).catch((error) => {
      console.error(error);
      process.exit(1);
    });
  });

cli.parse(process.argv);
