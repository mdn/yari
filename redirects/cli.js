#!/usr/bin/env node
const program = require("@caporal/core").default;
const chalk = require("chalk");

const { Redirect, Document } = require("../content");

program
  .version("0.0.0")
  .command("validate", "Check the _redirects.txt file(s)")
  .action(({ logger }) => {
    try {
      Redirect.load(null, true);
      logger.info(chalk.green("🍾 All is well in the world of redirects 🥂"));
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  })

  .command("test", "Test a URL (pathname) to see if it redirects")
  .argument("[urls...]")
  .action(({ args, logger }) => {
    try {
      for (const url of args.urls) {
        const resolved = Redirect.resolve(url);
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
  .argument("<from>", "From-URL", {
    validator: (value) => {
      Redirect.validateFromURL(value);
      return value;
    },
  })
  .argument("<to>", "To-URL", {
    validator: (value) => {
      Redirect.validateToURL(value);
      return value;
    },
  })
  .action(({ args, logger }) => {
    const { from, to } = args;
    const locale = from.split("/")[1];
    Redirect.add(locale, [[from, to]]);
    logger.info(chalk.green(`Saved '${from}' → '${to}'`));
  });

program.run();
