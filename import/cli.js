#!/usr/bin/env node
const cli = require("caporal");

const {
  DATABASE_URL,
  EXCLUDE_SLUG_PREFIXES,
  IMPORT_LOCALES,
} = require("./constants");
const runImporter = require("./import");

cli
  .version(require("./package.json").version)
  .option(
    "-l, --locales <locale>",
    "locales to limit on",
    cli.ARRAY,
    IMPORT_LOCALES
  )
  .option("--no-progressbar", "no progress bar but listing instead", cli.BOOL)
  .option("--start-clean", "delete anything created first", cli.BOOL)
  .option(
    "--exclude-prefixes <prefixes>",
    "slug prefixes to exclude (commas)",
    cli.ARRAY,
    EXCLUDE_SLUG_PREFIXES.join(",")
  )
  .argument(
    "[URL]",
    "database url for connecting to MySQL",
    cli.STRING,
    DATABASE_URL
  )
  .action((args, options) => {
    options.dbURL = args.url;
    return runImporter(options).catch((error) => {
      console.error("error while importing documents:", error);
      process.exit(1);
    });
  });

cli.parse(process.argv);
