#!/usr/bin/env node
const cli = require("caporal");

const runImporter = require("./scripts/importer");
const { runBuild } = require("./scripts/build");
const { runMakePopularitiesFile } = require("./scripts/popularities");
const { Sources } = require("./scripts/sources");
const {
  getMostPopularBuilds,
  inlineCSSPostProcess,
} = require("./scripts/postprocess");

const {
  DEFAULT_DATABASE_URL,
  DEFAULT_EXCLUDE_SLUG_PREFIXES,
  DEFAULT_BUILD_ROOT,
  DEFAULT_BUILD_ARCHIVE_ROOT,
  DEFAULT_BUILD_DESTINATION,
  DEFAULT_BUILD_LOCALES,
  DEFAULT_BUILD_NOT_LOCALES,
  DEFAULT_SITEMAP_BASE_URL,
  DEFAULT_LIVE_SAMPLES_BASE_URL,
  DEFAULT_INTERACTIVE_EXAMPLES_BASE_URL,
  DEFAULT_FOLDER_SEARCHES,
  DEFAULT_FLAW_LEVELS,
  MAX_GOOGLE_ANALYTICS_URIS,
  DEFAULT_POPULARITIES_FILEPATH,
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

  .command(
    "build",
    "turns Wiki HTML files into JSON files that the renderer can process"
  )
  .option(
    "-r, --root <path>",
    "main root to get content with Kuma HTML",
    cli.PATH,
    DEFAULT_BUILD_ROOT
  )
  .option(
    "-a, --archive-root <path>",
    "archived content files",
    cli.PATH,
    DEFAULT_BUILD_ARCHIVE_ROOT
  )
  .option(
    "-s, --stumptown-root <path>",
    "stumptown packaged files",
    cli.PATH,
    process.env.BUILD_STUMPTOWN_ROOT
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
  .option(
    "--flaw-levels <levels>",
    "How to deal with imperfections in the content building process",
    cli.STRING,
    DEFAULT_FLAW_LEVELS
  )
  .option("--no-progressbar", "no progress bar but listing instead", cli.BOOL)
  .option("--start-clean", "delete anything created first", cli.BOOL)
  .option("--list-locales", "display all locales and their counts", cli.BOOL)
  .option(
    "--ensure-titles",
    "make sure the _all-titles.json file is prepared",
    cli.BOOL
  )
  .option("--no-cache", "never benefit from the cache", cli.BOOL)
  .option(
    "--regenerate-all-titles",
    "don't reuse existing _all-titles.json",
    cli.BOOL
  )
  .option(
    "--allow-stale-titles",
    "reuse _all-titles.json if it exists independent of cache hashing",
    cli.BOOL
  )
  .option("--no-sitemaps", "don't generate all sitemap xml files", cli.BOOL)
  .option("--slugsearch <partofslug>", "filter by slug matches", cli.ARRAY, [])
  .option(
    "-f, --foldersearch <partoffolder>",
    "filter by folder matches",
    cli.ARRAY,
    DEFAULT_FOLDER_SEARCHES
  )
  .option(
    "--popularitiesfile <path>",
    "JSON file that maps URIs to popularities",
    cli.PATH,
    DEFAULT_POPULARITIES_FILEPATH
  )
  .option(
    "--sitemap-base-url <url>",
    "absolute url prefixing the sitemap.xml files",
    cli.STRING,
    DEFAULT_SITEMAP_BASE_URL
  )
  .option(
    "--live-samples-base-url <url>",
    "absolute url prefixing the live samples",
    cli.STRING,
    DEFAULT_LIVE_SAMPLES_BASE_URL
  )
  .option(
    "--interactive-examples-base-url <url>",
    "absolute url prefixing the interactive examples",
    cli.STRING,
    DEFAULT_INTERACTIVE_EXAMPLES_BASE_URL
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
    DEFAULT_BUILD_DESTINATION
  )
  .action(async (args, options, logger) => {
    // Build up the 'sources' based on the various paths arguments.
    const sources = new Sources();
    if (options.stumptownRoot) {
      sources.add(options.stumptownRoot, {
        isStumptown: true,
      });
    }
    if (options.root) {
      sources.add(options.root, {
        watch: true,
      });
    }
    if (options.archiveRoot) {
      sources.add(options.archiveRoot, {
        watch: false,
        htmlAlreadyRendered: true,
        excludeInTitlesJson: true,
        excludeInSitemaps: true,
        noindexNofollowHeader: true,
      });
    }

    // Validate that there is at least >=1 source
    if (!sources.entries().length) {
      logger.error("No configured sources");
      return 1;
    }

    // Because you can't have boolean options that default to 'true'
    // we'll do this check manually.
    if (!process.stdout.columns) {
      // No TTY, definitely no progressbar
      options.noProgressbar = true;
    }
    options.destination = args.destination;
    if (options.startClean || (options.noCache && options.ensureTitles)) {
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
    if (options.foldersearch.some((x) => /[A-Z]/.test(x))) {
      const newFoldersearch = options.foldersearch.map((x) => x.toLowerCase());
      console.warn(
        `Folder search lowercased from '${options.foldersearch}' to '${newFoldersearch}'`
      );
      options.foldersearch = newFoldersearch;
    }

    try {
      await runBuild(sources, options, logger);
    } catch (err) {
      console.error(err);
      throw err;
    }
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
  })
  .command("postprocess", "Perfect built pages")
  .option(
    "--build-root <path>",
    "location of built HTML files",
    cli.PATH,
    DEFAULT_BUILD_DESTINATION
  )
  .option(
    "-l, --locales <locale>",
    "locales to limit on",
    cli.ARRAY,
    DEFAULT_BUILD_LOCALES
  )
  .option("--no-progressbar", "no progress bar but listing instead", cli.BOOL)
  .option(
    "--max-files <number>",
    "max number of built files to postprocess",
    cli.INTEGER,
    100
  )
  .action((args, options) => {
    if (!options.locales.length) {
      throw new Error("Must provide at least 1 locale");
    }
    const builds = getMostPopularBuilds(options);
    if (!builds.length) {
      throw new Error("No popular builds found to post process");
    }
    inlineCSSPostProcess(builds).catch(() => {
      console.log(
        chalk.bold.red(
          `inlineCSSPostProcess failed on ${buildRoot} with ${subset.length} tasks`
        )
      );
      // process.exitCode = 1;
    });
  });

cli.parse(process.argv);

function equalArray(a, b) {
  return a.length === b.length && a.every((x, i) => x === b[i]);
}
