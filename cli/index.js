#!/usr/bin/env node
const cli = require("caporal");
const { OPTION_DEFAULTS: SSR_OPTION_DEFAULTS, run: runSSR } = require("ssr");

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
    SSR_OPTION_DEFAULTS["build-html"]
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
  .action((args, options) => runSSR(args.paths, options));

cli.parse(process.argv);
