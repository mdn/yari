import type { ActionParameters, Program } from "@caporal/core";
import chalk from "chalk";
import inquirer from "inquirer";

import { DEFAULT_LOCALE, VALID_LOCALES } from "../../libs/constants/index.js";
import { tryOrExit } from "../util.js";
import { Document } from "../../content/index.js";

interface MoveActionParameters extends ActionParameters {
  args: {
    oldSlug: string;
    newSlug: string;
    locale: string;
  };
  options: {
    yes: boolean;
  };
}

export function moveCommand(program: Program) {
  return program
    .command("move", "Move content to a new slug")
    .argument("<oldSlug>", "Old slug")
    .argument("<newSlug>", "New slug", {
      validator: (value) => {
        if (typeof value === "string" && value.includes("#")) {
          throw new Error("slug can not contain the '#' character");
        }
        return value;
      },
    })
    .argument("[locale]", "Locale", {
      default: DEFAULT_LOCALE,
      validator: [...VALID_LOCALES.values()],
    })
    .option("-y, --yes", "Assume yes", { default: false })
    .action(
      tryOrExit(async ({ args, options }: MoveActionParameters) => {
        const { oldSlug, newSlug, locale } = args;
        const { yes } = options;
        const changes = Document.move(oldSlug, newSlug, locale, {
          dry: true,
        });
        console.log(
          chalk.green(
            `Will move ${changes.length} documents from ${oldSlug} to ${newSlug} for ${locale}`
          )
        );
        console.log(
          changes
            .map(([from, to]) => `${chalk.red(from)} → ${chalk.green(to)}`)
            .join("\n")
        );
        const { run } = yes
          ? { run: true }
          : await inquirer.prompt({
              type: "confirm",
              message: "Proceed?",
              name: "run",
              default: true,
            });
        if (run) {
          const moved = Document.move(oldSlug, newSlug, locale);
          console.log(chalk.green(`Moved ${moved.length} documents.`));
        }
      })
    );
}
