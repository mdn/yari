#!/usr/bin/env node
const path = require("path");

const cli = require("caporal");

const {
  DATABASE_URL,
  EXCLUDE_SLUG_PREFIXES,
  IMPORT_LOCALES,
} = require("./constants");
const { VALID_LOCALES } = require("../content");

const runImporter = require("./import");
const runMakePopularitiesFile = require("./popularities");

cli
  .version(require("./package.json").version)
  .command("import")
  .help("Turn MySQL data into files on disk")
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
  })

  .command("makepopularities")
  .help("Transform a Google Analytics CSV report into a popularities.json file")
  .option(
    "--exclude-prefixes <prefixes>",
    "slug prefixes to exclude (commas)",
    cli.ARRAY,
    EXCLUDE_SLUG_PREFIXES.join(",")
  )
  .option(
    "-l, --locales <locale>",
    "locales to limit on",
    (value) => {
      const checked = [];
      const locales = Array.isArray(value) ? value : Array(value);
      for (const locale of locales) {
        const localeLC = locale.toLowerCase();
        if (!VALID_LOCALES.has(localeLC)) {
          throw new Error(`'${locale}' is not a valid locale`);
        }
        checked.push(localeLC);
      }
      return checked;
    },
    []
  )
  .option(
    "-m, --max-uris <number>",
    "Number of URIs. Defaults to 20,000",
    cli.INTEGER,
    20000
  )
  .option(
    "-o, --outfile <path>",
    "Defaults to ./popularities.json",
    cli.STRING,
    path.resolve("popularities.json")
  )
  .argument("csvfile", "Google Analytics pages report CSV file")
  .action((args, options, logger) => {
    // console.log("ARGS", args);
    // console.log("OPTIONS", options);
    return runMakePopularitiesFile(args.csvfile, options, logger).catch(
      (error) => {
        console.error("error generating JSON file:", error);
        process.exit(1);
      }
    );
  });

cli.parse(process.argv);
