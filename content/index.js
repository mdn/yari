#!/usr/bin/env node

const cli = require("caporal");

const { runImporter } = require("./scripts/importer");
const { runBuild } = require("./scripts/build");
const {
  DEFAULT_ROOT,
  DEFAULT_DATABASE_URL,
  DEFAULT_DESTINATION,
  DEFAULT_EXCLUDE_SLUG_PREFIXES
} = require("./scripts/constants.js");

cli
  .version(require("./package.json").version)
  .option("--version", "show version info and exit", cli.BOOL)
  .action((args, options) => {
    if (options.version) {
      console.log(require("./package.json").version);
    } else {
      cli._help();
    }
  })
  .command("import", "turns Kuma Wiki documents, from mysql, to files")
  .option(
    "-r, --root <path>",
    "root of where to save file",
    cli.PATH,
    DEFAULT_ROOT
  )
  .option("-l, --locales <locale>", "locales to limit on", cli.ARRAY, [])
  .option("--no-progressbar", "no progress bar but listing instead", cli.BOOL)
  .option("--start-clean", "delete anything created first", cli.BOOL)
  .option(
    "--exclude-prefixes <prefixes>",
    "slug prefixes to exclude (commas)",
    cli.ARRAY,
    DEFAULT_EXCLUDE_SLUG_PREFIXES.join(",")
  )
  .argument(
    "[URL]",
    "database url for connecting to MySQL",
    cli.STRING,
    DEFAULT_DATABASE_URL
  )
  .action((args, options) => {
    options.dbURL = args.url;
    return runImporter(options);
  })

  // XXX Hey @Gregoor, how do I set global options that can be shared across all commands?
  .command(
    "build",
    "turns Wiki HTML files into JSON files that the renderer can process"
  )
  .option(
    "-r, --root <path>",
    "root of where to save file",
    cli.PATH,
    DEFAULT_ROOT
  )
  .option("-l, --locales <locale>", "locales to limit on", cli.ARRAY, [])
  .option("--no-progressbar", "no progress bar but listing instead", cli.BOOL)
  .option(
    "-s, --slugsearch <partofslug>",
    "filter by slug matches",
    cli.ARRAY,
    []
  )
  .option(
    "-f, --foldersearch <partoffolder>",
    "filter by folder matches",
    cli.ARRAY,
    []
  )
  .argument(
    "[destination]",
    "root folder to put built files into",
    cli.STRING,
    DEFAULT_DESTINATION
  )
  .action((args, options) => {
    options.destination = args.destination;
    return runBuild(options);
  });

cli.parse(process.argv);
