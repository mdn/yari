#!/usr/bin/env node
const cli = require("caporal");

const { renderDocuments } = require("./scripts/build");
const runImporter = require("./scripts/importer");
const { runMakePopularitiesFile } = require("./scripts/popularities");

const {
  DEFAULT_DATABASE_URL,
  DEFAULT_EXCLUDE_SLUG_PREFIXES,
  DEFAULT_BUILD_ROOT,
  DEFAULT_BUILD_ARCHIVE_ROOT,
  DEFAULT_BUILD_LOCALES,
  MAX_GOOGLE_ANALYTICS_URIS,
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
    "root of where to save active content files",
    cli.PATH,
    DEFAULT_BUILD_ROOT
  )
  .option(
    "-a, --archive-root <path>",
    "root of where to save the archive content files",
    cli.PATH,
    DEFAULT_BUILD_ARCHIVE_ROOT
  )
  .option(
    "-l, --locales <locale>",
    "locales to limit on",
    cli.ARRAY,
    DEFAULT_BUILD_LOCALES
  )
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
  .action((args, options, logger) => {
    options.dbURL = args.url;
    return runImporter(options);
  })

  .command("render")
  .action(async () => {
    await renderDocuments();
  })

  .command(
    "popularities",
    "Convert a Google Analytics pageviews CSV into a popularities.json file"
  )
  .option(
    "--outfile <path>",
    "export from Google Analytics containing pageview counts",
    cli.PATH,
    process.env.BUILD_POPULARITIES_FILEPATH || "content/popularities.json"
  )
  .option(
    "--max-uris <number>",
    "export from Google Analytics containing pageview counts",
    cli.INTEGER,
    MAX_GOOGLE_ANALYTICS_URIS
  )
  .argument("csvfile", "Google Analytics pageviews CSV file", cli.PATH)
  .action((args, options, logger) => {
    return runMakePopularitiesFile(args.csvfile, options, logger);
  });

cli.parse(process.argv);
