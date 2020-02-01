#!/usr/bin/env node

const cli = require("caporal");

const { runImporter } = require("./scripts/importer");
const { runBuild } = require("./scripts/build");
const {
  DEFAULT_ROOT,
  DEFAULT_DATABASE_URL,
  DEFAULT_DESTINATION,
  DEFAULT_EXCLUDE_SLUG_PREFIXES,
  DEFAULT_BUILD_LOCALES,
  DEFAULT_BUILD_NOT_LOCALES,
  DEFAULT_SITEMAP_BASE_URL,
  DEFAULT_FOLDER_SEARCHES
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
    return runImporter(options, logger);
  })

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
  .option(
    "-l, --locales <locale>",
    "locales to limit on",
    cli.ARRAY,
    DEFAULT_BUILD_LOCALES
  )
  .option(
    "--not-locales <locale>",
    "locales to explicitly exclude",
    cli.ARRAY,
    DEFAULT_BUILD_NOT_LOCALES
  )
  .option("--no-progressbar", "no progress bar but listing instead", cli.BOOL)
  .option("--start-clean", "delete anything created first", cli.BOOL)
  .option("--list-locales", "display all locales and their counts", cli.BOOL)
  .option("--no-cache", "never benefit from the cache", cli.BOOL)
  .option(
    "--regenerate-all-titles",
    "don't reuse existing _all-titles.json",
    cli.BOOL
  )
  .option("--no-sitemaps", "don't generate all sitemap xml files", cli.BOOL)
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
    DEFAULT_FOLDER_SEARCHES
  )
  .option(
    "--googleanalytics-pageviews-csv <path>",
    "export from Google Analytics containing pageview counts",
    cli.PATH
  )
  .option(
    "--sitemap-base-url <url>",
    "absolute url prefixing the sitemap.xml files",
    cli.STRING,
    DEFAULT_SITEMAP_BASE_URL
  )
  .option(
    "--watch",
    "monitor the source and re-run when files change",
    cli.BOOL,
    false
  )
  .option(
    "--build-and-watch",
    "run the build first, then start watching",
    cli.BOOL,
    false
  )
  .option(
    "--build-json-only",
    "only generate the index.json and not the index.html",
    cli.BOOL,
    false
  )
  .argument(
    "[destination]",
    "root folder to put built files into",
    cli.STRING,
    DEFAULT_DESTINATION
  )
  .action(async (args, options, logger) => {
    // Because you can't have boolean options that default to 'true'
    // we'll do this check manually.
    if (!process.stdout.columns) {
      // No TTY, definitely no progressbar
      options.noProgressbar = true;
    }
    options.destination = args.destination;
    if (options.startClean) {
      options.regenerateAllTitles = true;
    }
    // Sanity check the invariance of locales filtering.
    if (options.locales.length && options.notLocales.length) {
      if (equalArray(options.locales, DEFAULT_BUILD_LOCALES)) {
        options.locales = [];
      } else {
        throw new Error("Can't specify --locales AND --not-locales");
      }
    }
    if (options.foldersearch.some(x => /[A-Z]/.test(x))) {
      const newFoldersearch = options.foldersearch.map(x => x.toLowerCase());
      console.warn(
        `Folder search lowercased from '${options.foldersearch}' to '${newFoldersearch}'`
      );
      options.foldersearch = newFoldersearch;
    }
    return runBuild(options, logger);
  });

cli.parse(process.argv);

function equalArray(a, b) {
  return a.length === b.length && a.every((x, i) => x === b[i]);
}
