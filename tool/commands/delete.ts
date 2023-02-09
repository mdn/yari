import type { ActionParameters, Program } from "@caporal/core";
import chalk from "chalk";
import inquirer from "inquirer";

import { DEFAULT_LOCALE, VALID_LOCALES } from "../../libs/constants/index.js";
import { tryOrExit } from "../util.js";
import { Document } from "../../content/index.js";

interface DeleteActionParameters extends ActionParameters {
  args: {
    slug: string;
    locale: string;
  };
  options: {
    recursive: boolean;
    redirect?: string;
    yes: boolean;
  };
}

export function deleteCommand(program: Program) {
  return program
    .command("delete", "Delete content")
    .argument("<slug>", "Slug")
    .argument("[locale]", "Locale", {
      default: DEFAULT_LOCALE,
      validator: [...VALID_LOCALES.values()],
    })
    .option("-r, --recursive", "Delete content recursively", { default: false })
    .option(
      "--redirect <redirect>",
      "Redirect document (and its children, if --recursive is true) to the URL <redirect>"
    )
    .option("-y, --yes", "Assume yes", { default: false })
    .action(
      tryOrExit(async ({ args, options }: DeleteActionParameters) => {
        const { slug, locale } = args;
        const { recursive, redirect, yes } = options;
        const changes = Document.remove(slug, locale, {
          recursive,
          redirect,
          dry: true,
        });
        console.log(chalk.green(`Will remove ${changes.length} documents:`));
        console.log(chalk.red(changes.join("\n")));
        if (redirect) {
          console.log(
            chalk.green(
              `Redirecting ${
                recursive ? "each document" : "document"
              } to: ${redirect}`
            )
          );
        } else {
          console.error(
            chalk.yellow(
              "Deleting without a redirect. Consider using the --redirect option with a related page instead."
            )
          );
        }
        const { run } = yes
          ? { run: true }
          : await inquirer.prompt({
              type: "confirm",
              message: "Proceed?",
              name: "run",
              default: true,
            });
        if (run) {
          const removed = Document.remove(slug, locale, {
            recursive,
            redirect,
          });
          console.log(chalk.green(`Moved ${removed.length} documents.`));
        }
      })
    );
}
