import fs from "node:fs";
import path from "node:path";

import type { ActionParameters, Program } from "@caporal/core";
import openEditor from "open-editor";

import { DEFAULT_LOCALE, VALID_LOCALES } from "../../libs/constants/index.js";
import { tryOrExit } from "../util.js";
import { Document } from "../../content/index.js";

interface CreateActionParameters extends ActionParameters {
  args: {
    slug: string;
    locale: string;
  };
}

export function createCommand(program: Program) {
  return program
    .command("create", "Spawn your Editor for a new slug")
    .argument("<slug>", "Slug of the document in question")
    .argument("[locale]", "Locale", {
      default: DEFAULT_LOCALE,
      validator: [...VALID_LOCALES.values()],
    })
    .action(
      tryOrExit(({ args }: CreateActionParameters) => {
        const { slug, locale } = args;
        const parentSlug = Document.parentSlug(slug);
        if (!Document.exists(parentSlug, locale)) {
          throw new Error(`Parent ${parentSlug} does not exists for ${locale}`);
        }
        if (Document.exists(slug, locale)) {
          throw new Error(`${slug} already exists for ${locale}`);
        }
        const filePath = Document.fileForSlug(slug, locale);
        fs.mkdirSync(path.basename(filePath), { recursive: true });
        openEditor([filePath]);
      })
    );
}
