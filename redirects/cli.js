#!/usr/bin/env node
const cli = require("caporal");
const chalk = require("chalk");

const { resolve, load } = require("../content/redirect");

cli
  .version("0.0.0")
  .command("validate", "Check the _redirects.txt file(s)")
  .action((args, options, logger) => {
    try {
      load(null, true);
      logger.info(chalk.green("🍾 All is well in the world of redirects 🥂"));
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  })

  .command("test", "Test a URL (pathname) to see if it redirects")
  .argument("[urls...]")
  .action((args, options, logger) => {
    try {
      for (const url of args.urls) {
        const resolved = resolve(url);
        if (resolved === url) {
          logger.info(chalk.yellow(`${url.padEnd(50)} Not a redirecting URL`));
        } else {
          logger.info(chalk.green(`${url.padEnd(50)} -> ${resolved}`));
        }
      }
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  })

  .command("add", "Add a new redirect")
  .option("--locale", "Which locale (defaults to 'en-US')")
  .argument("[from, to]")
  .action((args, options) => {
    throw new Error("not implemented yet");
  });

cli.parse(process.argv);
