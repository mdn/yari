#!/usr/bin/env node
const program = require("@caporal/core").default;
const chalk = require("chalk");

const {
  add,
  resolve,
  load,
  validateFromURL,
  validateToURL,
} = require("../content/redirect");

program
  .version("0.0.0")
  .command("validate", "Check the _redirects.txt file(s)")
  .action(({ logger }) => {
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
  .action(({ args, logger }) => {
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
  .argument("<from>", "From-URL", {
    validator: (value) => {
      validateFromURL(value);
      return value;
    },
  })
  .argument("<to>", "To-URL", {
    validator: (value) => {
      validateToURL(value);
      return value;
    },
  })
  .action(({ args, logger }) => {
    const { from, to } = args;
    const locale = from.split("/")[1];
    add(locale, from, to);
    logger.info(chalk.green(`Saved '${from}' → '${to}'`));
  });

program.run();
