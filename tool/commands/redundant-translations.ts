import fs from "node:fs";
import { Program } from "@caporal/core";

import { tryOrExit } from "../util.js";
import { CONTENT_TRANSLATED_ROOT } from "../../libs/env/index.js";
import { Document } from "../../content/index.js";

export function redundantTranslationsCommand(program: Program) {
  return program
    .command("redundant-translations", "Find redundant translations")
    .action(
      tryOrExit(async () => {
        if (!CONTENT_TRANSLATED_ROOT) {
          throw new Error("CONTENT_TRANSLATED_ROOT not set");
        }
        if (!fs.existsSync(CONTENT_TRANSLATED_ROOT)) {
          throw new Error(`${CONTENT_TRANSLATED_ROOT} does not exist`);
        }
        const documents = Document.findAll();
        if (!documents.count) {
          throw new Error("No documents to analyze");
        }
        // Build up a map of translations by their `translation_of`
        const map = new Map();
        for (const document of documents.iterDocs()) {
          if (!document.isTranslated) continue;
          const { translation_of, locale } = document.metadata;
          if (!map.has(translation_of)) {
            map.set(translation_of, new Map());
          }
          if (!map.get(translation_of).has(locale)) {
            map.get(translation_of).set(locale, []);
          }
          map
            .get(translation_of)
            .get(locale)
            .push(
              Object.assign(
                { filePath: document.fileInfo.path },
                document.metadata
              )
            );
        }
        // Now, let's investigate those with more than 1
        let sumENUS = 0;
        let sumTotal = 0;
        for (const [translation_of, localeMap] of map) {
          for (const [, metadatas] of localeMap) {
            if (metadatas.length > 1) {
              // console.log(translation_of, locale, metadatas);
              sumENUS++;
              sumTotal += metadatas.length;
              console.log(
                `https://developer.allizom.org/en-US/docs/${translation_of}`
              );
              for (const metadata of metadatas) {
                console.log(metadata);
              }
            }
          }
        }
        console.warn(
          `${sumENUS} en-US documents have multiple translations with the same locale`
        );
        console.log(
          `In total, ${sumTotal} translations that share the same translation_of`
        );
      })
    );
}
