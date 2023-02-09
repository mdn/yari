import type { ActionParameters, Program } from "@caporal/core";
import chalk from "chalk";

import { DEFAULT_LOCALE, VALID_LOCALES } from "../../libs/constants/index.js";
import { tryOrExit } from "../util.js";
import { Redirect } from "../../content/index.js";

interface FixRedirectsActionParameters extends ActionParameters {
  args: {
    locales: string[];
  };
}

export function fixRedirectsCommand(program: Program) {
  return program
    .command("fix-redirects", "Consolidate/fix redirects")
    .argument("<locales...>", "Locale", {
      default: [DEFAULT_LOCALE],
      validator: [...VALID_LOCALES.values(), ...VALID_LOCALES.keys()],
    })
    .action(
      tryOrExit(({ args, logger }: FixRedirectsActionParameters) => {
        for (const locale of args.locales) {
          Redirect.add(locale.toLowerCase(), [], { fix: true, strict: true });
          logger.info(chalk.green(`Fixed ${locale}`));
        }
      })
    );
}
