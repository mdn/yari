import type { ActionParameters, Program } from "@caporal/core";

import {
  DEFAULT_LOCALE,
  VALID_FLAW_CHECKS,
  VALID_LOCALES,
} from "../../libs/constants/index.js";
import { tryOrExit } from "../util.js";
import { buildDocument } from "../../build/index.js";
import { Document } from "../../content/index.js";

interface FixFlawsActionParameters extends ActionParameters {
  args: {
    fixFlawsTypes: string[];
  };
  options: {
    locale: string;
    fileTypes: string[];
  };
}

export function fixFlawsCommand(program: Program) {
  return program
    .command("fix-flaws", "Fix all flaws")
    .option("-l, --locale <locale>", "locale", {
      default: DEFAULT_LOCALE,
      validator: [...VALID_LOCALES.values()],
    })
    .option("--file-types <fileTypes...>", "File types to fix flaws in", {
      default: ["md"],
      validator: ["md", "html"],
    })
    .argument("<fix-flaws-types...>", "flaw types", {
      default: ["broken_links"],
      validator: [...VALID_FLAW_CHECKS],
    })
    .action(
      tryOrExit(async ({ args, options }: FixFlawsActionParameters) => {
        const { fixFlawsTypes } = args;
        const { locale, fileTypes } = options;
        const allDocs = Document.findAll({
          locales: new Map([[locale.toLowerCase(), true]]),
        });
        for (const document of allDocs.iterDocs()) {
          if (fileTypes.includes(document.isMarkdown ? "md" : "html")) {
            await buildDocument(document, {
              fixFlaws: true,
              fixFlawsTypes: new Set(fixFlawsTypes),
              fixFlawsVerbose: true,
            });
          }
        }
      })
    );
}
