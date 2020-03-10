#!/usr/bin/env node
const cli = require("caporal");

const { runImporter } = require("./scripts/importer");
const { runBuild } = require("./scripts/build");
const { runMakePopularitiesFile } = require("./scripts/popularities");
const { Sources } = require("./scripts/sources");

const {
  DEFAULT_DATABASE_URL,
  DEFAULT_EXCLUDE_SLUG_PREFIXES,
  DEFAULT_BUILD_LOCALES,
  DEFAULT_BUILD_NOT_LOCALES,
  DEFAULT_SITEMAP_BASE_URL,
  DEFAULT_FOLDER_SEARCHES,
  DEFAULT_POPULARITIES_FILEPATH,
  MAX_GOOGLE_ANALYTICS_URIS
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
    process.env.BUILD_ROOT || "content/files"
  )
  .option(
    "-a, --archive-root <path>",
    "root of where to save the archive content files",
    cli.PATH,
    process.env.BUILD_ARCHIVE_ROOT || "archivecontent/files"
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
    "main root to get content with Kuma HTML",
    cli.PATH,
    process.env.BUILD_ROOT
  )
  .option(
    "-a, --archive-root <path>",
    "archived content files",
    cli.PATH,
    process.env.BUILD_ARCHIVE_ROOT
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
    process.env.BUILD_POPULARITIES_FILEPATH
    // DEFAULT_POPULARITIES_FILEPATH
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
    process.env.BUILD_DESTINATION || "client/build"
  )
  .action((args, options, logger) => {
    const sources = new Sources();
    if (options.stumptownRoot) {
      sources.add(options.stumptownRoot, {
        isStumptown: true
      });
    }
    if (options.root) {
      sources.add(options.root, {
        watch: true
      });
    }
    if (options.archiveRoot) {
      sources.add(options.archiveRoot, {
        watch: false,
        htmlAlreadyRendered: true,
        excludeInTitlesJson: true,
        excludeInSitemaps: true,
        noindexNofollowHeader: true
      });
    }
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
    if (options.foldersearch.some(x => /[A-Z]/.test(x))) {
      const newFoldersearch = options.foldersearch.map(x => x.toLowerCase());
      console.warn(
        `Folder search lowercased from '${options.foldersearch}' to '${newFoldersearch}'`
      );
      options.foldersearch = newFoldersearch;
    }

    return runBuild(sources, options, logger);
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

cli.parse(process.argv).then(r => {
  // If the command explicitly returned a number, use that as the exit code
  // Otherwise, if it's anything truthy return 1 or all else 0.
  process.exit(typeof r === Number ? r : r ? 1 : 0);
});

function equalArray(a, b) {
  return a.length === b.length && a.every((x, i) => x === b[i]);
}

// function relPath(absPath) {
//   return path.relative(process.cwd(), absPath);
// }
