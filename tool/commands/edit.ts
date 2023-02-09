import type { ActionParameters, Program } from "@caporal/core";
import openEditor from "open-editor";

import { DEFAULT_LOCALE, VALID_LOCALES } from "../../libs/constants/index.js";
import { tryOrExit } from "../util.js";
import { Document } from "../../content/index.js";

interface EditActionParameters extends ActionParameters {
  args: {
    slug: string;
    locale: string;
  };
}

export function editCommand(program: Program) {
  return program
    .command("edit", "Spawn your EDITOR for an existing slug")
    .argument("<slug>", "Slug of the document in question")
    .argument("[locale]", "Locale", {
      default: DEFAULT_LOCALE,
      validator: [...VALID_LOCALES.values()],
    })
    .action(
      tryOrExit(({ args }: EditActionParameters) => {
        const { slug, locale } = args;
        if (!Document.exists(slug, locale)) {
          throw new Error(`${slug} does not exists for ${locale}`);
        }
        const filePath = Document.fileForSlug(slug, locale);
        openEditor([filePath]);
      })
    );
}
