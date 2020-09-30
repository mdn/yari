#!/usr/bin/env node
const cli = require("caporal");
const path = require("path");

// const {
//   CONTENT_ROOT,
//   CONTENT_TRANSLATED_ROOT,
// } = require("../content/constants");
const { add, resolve, load } = require("../content/redirect");
// const { run } = require("./run");

cli
  .version("0.0.0")
  // .option(
  //   "--cwd <path>",
  //   "Explicit current-working-directory",
  //   cli.PATH,
  //   path.join(process.cwd(), "..")
  // )
  // .option(
  //   "--max-compression-difference-percentage <amount>",
  //   "Max percentage for reduction after compression",
  //   cli.FLOAT,
  //   MAX_COMPRESSION_DIFFERENCE_PERCENTAGE
  // )
  // .option(
  //   "--save-compression",
  //   "If it can be compressed, save the result",
  //   cli.BOOL
  // )
  .command("validate", "Check the _redirects.txt file(s)")
  .action((args, options) => {
    // console.log(args);
    try {
      load(null, true);
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
    // const cwd = options.cwd || process.cwd();
    // const allFilePaths = args.files.map((f) => path.resolve(cwd, f));
    // if (!allFilePaths.length) {
    //   throw new Error("no files to check");
    // }
    // return runChecker(allFilePaths, options).catch((error) => {
    //   console.error(error);
    //   process.exit(1);
    // });
  })

  .command("add", "Add a new redirect")
  .option("--locale", "Which locale (defaults to 'en-US')")
  .argument("[from, to]")
  .action((args, options) => {
    throw new Error("not implemented yet");
    // const cwd = options.cwd || process.cwd();
    // const allFilePaths = args.files.map((f) => path.resolve(cwd, f));
    // if (!allFilePaths.length) {
    //   throw new Error("no files to check");
    // }
    // return runChecker(allFilePaths, options).catch((error) => {
    //   console.error(error);
    //   process.exit(1);
    // });
  });

cli.parse(process.argv);
