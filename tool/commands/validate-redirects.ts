import type { Program } from "@caporal/core";
import chalk from "chalk";
import type { ActionParameters } from "types";

import { VALID_LOCALES } from "../../libs/constants/index.js";
import { tryOrExit } from "../util.js";
import { Redirect } from "../../content/index.js";

interface ValidateRedirectsActionParameters extends ActionParameters {
  args: {
    locales: string[];
  };
  options: {
    strict: boolean;
  };
}

export function validateRedirectsCommand(program: Program) {
  return program
    .command("validate-redirects", "Try loading the _redirects.txt file(s)")
    .argument("[locales...]", "Locale", {
      default: [...VALID_LOCALES.keys()],
      validator: [...VALID_LOCALES.keys()],
    })
    .option("--strict", "Strict validation")
    .action(
      tryOrExit(
        ({ args, options, logger }: ValidateRedirectsActionParameters) => {
          const { locales } = args;
          const { strict } = options;
          if (strict) {
            for (const locale of locales) {
              try {
                Redirect.validateLocale(locale, strict);
                logger.info(
                  chalk.green(`✓ redirects for ${locale} looking good!`)
                );
              } catch (e) {
                throw new Error(
                  `_redirects.txt for ${locale} is causing issues: ${e}`
                );
              }
            }
          } else {
            try {
              Redirect.load(locales, true);
            } catch (e) {
              throw new Error(`Unable to load redirects: ${e}`);
            }
          }

          logger.info(
            chalk.green("🍾 All is well in the world of redirects 🥂")
          );
        }
      )
    );
}
