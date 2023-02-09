import type { ActionParameters, Program } from "@caporal/core";
import chalk from "chalk";
import inquirer from "inquirer";

import { DEFAULT_LOCALE, VALID_LOCALES } from "../../libs/constants/index.js";
import { tryOrExit } from "../util.js";
import { buildDocument } from "../../build/index.js";
import { Document, buildURL } from "../../content/index.js";
import type { Doc } from "../../libs/types/document.js";

interface FlawsActionParameters extends ActionParameters {
  args: {
    slug: string;
    locale: string;
  };
  options: {
    yes: boolean;
  };
}

export function flawsCommand(program: Program) {
  return program
    .command("flaws", "Find (and fix) flaws in a document")
    .argument("<slug>", "Slug of the document in question")
    .argument("[locale]", "Locale", {
      default: DEFAULT_LOCALE,
      validator: [...VALID_LOCALES.values()],
    })
    .option("-y, --yes", "Assume yes", { default: false })
    .action(
      tryOrExit(async ({ args, options }: FlawsActionParameters) => {
        const { slug, locale } = args;
        const { yes } = options;
        const document = Document.findByURL(buildURL(locale, slug));
        if (!document) {
          throw new Error(`Slug ${slug} does not exist for ${locale}`);
        }
        const { doc }: { doc: Doc } = await buildDocument(document, {
          fixFlaws: true,
          fixFlawsDryRun: true,
        });

        const flaws = Object.values(doc.flaws || {})
          .map((a) => a.filter((f) => f.fixable).length || 0)
          .reduce((a, b) => a + b, 0);
        if (flaws === 0) {
          console.log(chalk.green("Found no fixable flaws!"));
          return;
        }
        const { run } = yes
          ? { run: true }
          : await inquirer.prompt({
              type: "confirm",
              message: `Proceed fixing ${flaws} flaws?`,
              name: "run",
              default: true,
            });
        if (run) {
          buildDocument(document, { fixFlaws: true, fixFlawsVerbose: true });
        }
      })
    );
}
