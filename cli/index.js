#!/usr/bin/env node
const cli = require("caporal");
const { OPTION_DEFAULTS: SSR_OPTION_DEFAULTS, run: runSSR } = require("ssr");
const boxify = require("./boxify");
const {
  writeContentVersion,
  checkContentVersion,
  VersionStatus
} = require("./content-version");

cli
  .option("--version", "show version info and exit", cli.BOOL)
  .action((args, options) => {
    if (options.version) {
      console.log(require("./package.json").version);
    } else {
      cli._help();
    }
  })

  .command("ssr", "render the content")
  .argument(
    "[paths...]",
    "paths to packaged content directories, will be ignored for --watch",
    cli.ARRAY
  )
  .option(
    "-o, --output <path>",
    "<path> to store built files",
    cli.STRING,
    SSR_OPTION_DEFAULTS.output
  )
  .option(
    "-b, --build-html",
    "also generate fully formed index.html files (or env var $CLI_BUILD_HTML)",
    cli.BOOL,
    SSR_OPTION_DEFAULTS.buildHtml
  )
  .option("-w, --watch", "watch stumptown content for changes", cli.BOOL)
  .option(
    "-t, --touchfile <file>",
    "<file> to touch to trigger client rebuild",
    cli.STRING,
    SSR_OPTION_DEFAULTS.touchfile
  )
  .option(
    "--quiet",
    "as little output as possible",
    cli.BOOL,
    SSR_OPTION_DEFAULTS.quiet
  )
  .option(
    "--no-progress-bar",
    "disable progress bar",
    cli.BOOL,
    SSR_OPTION_DEFAULTS.noProgressBar
  )
  .action((args, options) => runSSR(args.paths, options))

  .command(
    "write-content-version",
    'writes current content version to "/content.gitsha". Should only be called after a build.'
  )
  .action((args, options, logger) =>
    writeContentVersion().catch(e => {
      logger.error(e);
      process.exit(1);
    })
  )

  .command("check-content-version", "warns when content is out-of-date")
  .action(async (args, options, logger) => {
    const currentVersionStatus = await checkContentVersion();

    if (currentVersionStatus === VersionStatus.ALL_GOOD) {
      logger.info("Your content is up-to-date.");
      return;
    }

    const warnings = [
      "Your content build is out-of-date. To resolve, run these commands:"
    ];
    if (currentVersionStatus === VersionStatus.REMOTE_CHANGES) {
      warnings.push('"git submodule update" updates your submodule.');
    }
    warnings.push('"yarn build" creates a new build.');
    logger.warn(boxify(warnings));
  });

cli.parse(process.argv);
