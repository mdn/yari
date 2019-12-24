#!/usr/bin/env node

const cli = require("caporal");

const {
  runImporter,
  DEFAULT_DATABASE_URL,
  DEFAULT_ROOT
} = require("./scripts/importer");

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
  .argument(
    "[URL]",
    "database url for connecting to MySQL",
    cli.STRING,
    DEFAULT_DATABASE_URL
  )
  .option(
    "-r, --root <path>",
    "root of where to save file",
    cli.PATH,
    DEFAULT_ROOT
  )
  .option("-l, --locales <locale>", "locales to limit on", cli.ARRAY, [])
  .option("--no-progressbar", "no progress bar but listing instead", cli.BOOL)
  .action((args, options) => {
    options.dbURL = args.url;
    return runImporter(options);
  });

cli.parse(process.argv);
