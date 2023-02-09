import type { ActionParameters, Program } from "@caporal/core";
import chalk from "chalk";

import { Redirect } from "../../content/index.js";
import { tryOrExit } from "../util.js";

interface AddRedirectActionParameters extends ActionParameters {
  args: {
    from: string;
    to: string;
  };
}

export function addRedirectCommand(program: Program) {
  return program
    .command("add-redirect", "Add a new redirect")
    .argument("<from>", "From-URL")
    .argument("<to>", "To-URL")
    .action(
      tryOrExit(({ args, logger }: AddRedirectActionParameters) => {
        const from = new URL(args.from).pathname;
        const to = new URL(args.to).pathname;
        const locale = from.split("/")[1];
        Redirect.add(locale, [[from, to]]);
        logger.info(chalk.green(`Saved '${from}' → '${to}'`));
      })
    );
}
