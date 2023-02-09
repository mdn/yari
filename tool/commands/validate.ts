import type { ActionParameters, Program } from "@caporal/core";
import chalk from "chalk";

import { DEFAULT_LOCALE, VALID_LOCALES } from "../../libs/constants/index.js";
import { tryOrExit } from "../util.js";
import { buildDocument } from "../../build/index.js";
import { Document, buildURL } from "../../content/index.js";
import type { Doc } from "../../libs/types/document.js";

interface ValidateActionParameters extends ActionParameters {
  args: {
    slug: string;
    locale: string;
  };
}

export function validateCommand(program: Program) {
  return program
    .command("validate", "Validate a document")
    .argument("<slug>", "Slug of the document in question")
    .argument("[locale]", "Locale", {
      default: DEFAULT_LOCALE,
      validator: [...VALID_LOCALES.values()],
    })
    .action(
      tryOrExit(async ({ args }: ValidateActionParameters) => {
        const { slug, locale } = args;
        let okay = true;
        const document = Document.findByURL(buildURL(locale, slug));
        if (!document) {
          throw new Error(`Slug ${slug} does not exist for ${locale}`);
        }
        const { doc }: { doc: Doc } = await buildDocument(document);

        const flaws = Object.values(doc.flaws || {})
          .map((a) => a.length || 0)
          .reduce((a, b) => a + b, 0);
        if (flaws > 0) {
          console.log(chalk.red(`Found ${flaws} flaws.`));
          okay = false;
        }
        try {
          Document.validate(slug, locale);
        } catch (e) {
          console.log(chalk.red(e));
          okay = false;
        }
        if (okay) {
          console.log(chalk.green("✓ All seems fine"));
        }
      })
    );
}
