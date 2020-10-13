#!/usr/bin/env node
const program = require("@caporal/core").default;
const chalk = require("chalk");

const { add, resolve, load } = require("../content/redirect");
const { VALID_LOCALES, Document } = require("../content");

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
      const locale = value.split("/")[1];
      if (!locale || value.split("/")[2] !== "docs") {
        throw new Error("The from-URL is expected to be /$locale/docs/");
      }
      const validValues = [...VALID_LOCALES.values()];
      if (!validValues.includes(locale)) {
        throw new Error(`'${locale}' not in ${validValues}`);
      }
      const document = Document.findByURL(value);
      if (document) {
        throw new Error(
          `From-URL resolves to a file on disk (${document.fileInfo.path})`
        );
      }
      const resolved = resolve(value);
      if (resolved !== value) {
        throw new Error(
          `${value} is already matched as a redirect (to: '${resolved}')`
        );
      }
      return value;
    },
  })
  .argument("<to>", "To-URL", {
    validator: (value) => {
      // If it's not external, it has to go to a valid document
      if (value.includes("://")) {
        // If this throws, conveniently the validator will do its job.
        const url = new URL(value);
        if (url.protocol !== "https:") {
          throw new Error("We only redirect to https://");
        }
      } else {
        // Check that it's a valid document URL
        const locale = value.split("/")[1];
        if (!locale || value.split("/")[2] !== "docs") {
          throw new Error("The from-URL is expected to be /$locale/docs/");
        }
        const validValues = [...VALID_LOCALES.values()];
        if (!validValues.includes(locale)) {
          throw new Error(`'${locale}' not in ${validValues}`);
        }

        // Can't point to something that redirects to something
        const resolved = resolve(value);
        if (resolved !== value) {
          throw new Error(
            `${value} is already matched as a redirect (to: '${resolved}')`
          );
        }
        // XXX Commented out because how else are going to be able
        // redirect to archived documents.
        // // It has to match a document
        // const document = Document.findByURL(value);
        // if (!document) {
        //   throw new Error(
        //     `To-URL has to resolve to a file on disk (${document.fileInfo.path})`
        //   );
        // }
      }
      return value;
    },
  })
  .action(({ args }) => {
    const { from, to } = args;

    console.warn(chalk.yellow(`not implemented yet ('${from}' → '${to}')`));
  });

program.run();
