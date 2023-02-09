import type { ActionParameters, Program } from "@caporal/core";

import { tryOrExit } from "../util.js";
import { buildSPAs } from "../../build/spas.js";
import { CONTENT_ROOT, CONTENT_TRANSLATED_ROOT } from "../../libs/env/index.js";
import { Document } from "../../content/index.js";
import * as kumascript from "../../kumascript/index.js";
import {
  MacroInvocationError,
  MacroRedirectedLinkError,
} from "../../kumascript/src/errors.js";

interface MacrosActionParameters extends ActionParameters {
  args: {
    cmd: string;
    foldersearch: string;
    macros: string[];
  };
}

export function spasCommand(program: Program) {
  return program
    .command("spas", "Build (SSR) all the skeleton apps for single page apps")
    .action(
      tryOrExit(async ({ options }) => {
        await buildSPAs(options);
      })
    )

    .command(
      "macros",
      "Render and/or remove one or more macros from one or more documents"
    )
    .option("-f, --force", "Render even if there are non-fixable flaws", {
      default: false,
    })
    .argument("<cmd>", 'must be either "render" or "remove"')
    .argument("<foldersearch>", "folder of documents to target")
    .argument("<macros...>", "one or more macro names")
    .action(
      tryOrExit(async ({ args, options }: MacrosActionParameters) => {
        if (!CONTENT_ROOT) {
          throw new Error("CONTENT_ROOT not set");
        }
        if (!CONTENT_TRANSLATED_ROOT) {
          throw new Error("CONTENT_TRANSLATED_ROOT not set");
        }
        const { force } = options;
        const { cmd, foldersearch, macros } = args;
        const cmdLC = cmd.toLowerCase();
        if (!["render", "remove"].includes(cmdLC)) {
          throw new Error(`invalid macros command "${cmd}"`);
        }
        console.log(
          `${cmdLC} the macro(s) ${macros
            .map((m) => `"${m}"`)
            .join(", ")} within content folder(s) matching "${foldersearch}"`
        );
        const documents = Document.findAll({
          folderSearch: foldersearch,
        });
        if (!documents.count) {
          throw new Error("no documents found");
        }

        async function renderOrRemoveMacros(document) {
          try {
            return await kumascript.render(document.url, {
              invalidateCache: true,
              selective_mode: [cmdLC, macros],
            });
          } catch (error) {
            if (error instanceof MacroInvocationError) {
              error.updateFileInfo(document.fileInfo);
              throw new Error(
                `error trying to parse ${error.filepath}, line ${error.line} column ${error.column} (${error.error.message})`
              );
            }

            throw error;
          }
        }

        let countTotal = 0;
        let countSkipped = 0;
        let countModified = 0;
        let countNoChange = 0;
        for (const document of documents.iterDocs()) {
          countTotal++;
          console.group(`${document.fileInfo.path}:`);
          const originalRawBody = document.rawBody;
          let [$, flaws] = await renderOrRemoveMacros(document);
          if (flaws.length) {
            const fixableFlaws = flaws.filter(
              (f): f is MacroRedirectedLinkError =>
                Object.prototype.hasOwnProperty.call(f, "redirectInfo")
            );
            const nonFixableFlaws = flaws.filter(
              (f) => !Object.prototype.hasOwnProperty.call(f, "redirectInfo")
            );
            const nonFixableFlawNames = [
              ...new Set(nonFixableFlaws.map((f) => f.name)).values(),
            ].join(", ");
            if (force || nonFixableFlaws.length === 0) {
              // They're all fixable or we don't care if some or all are
              // not, but let's at least fix any that we can.
              if (nonFixableFlaws.length > 0) {
                console.log(
                  `ignoring ${nonFixableFlaws.length} non-fixable flaw(s) (${nonFixableFlawNames})`
                );
              }
              if (fixableFlaws.length) {
                console.group(
                  `fixing ${fixableFlaws.length} fixable flaw(s) before proceeding:`
                );
                // Let's start fresh so we don't keep the "data-flaw-src"
                // attributes that may have been injected during the rendering.
                document.rawBody = originalRawBody;
                for (const flaw of fixableFlaws) {
                  const suggestion = flaw.macroSource.replace(
                    flaw.redirectInfo.current,
                    flaw.redirectInfo.suggested
                  );
                  document.rawBody = document.rawBody.replace(
                    flaw.macroSource,
                    suggestion
                  );
                  console.log(`${flaw.macroSource} --> ${suggestion}`);
                }
                console.groupEnd();
                Document.update(
                  document.url,
                  document.rawBody,
                  document.metadata
                );
                // Ok, we've fixed the fixable flaws, now let's render again.
                [$, flaws] = await renderOrRemoveMacros(document);
              }
            } else {
              // There are one or more flaws that we can't fix, and we're not
              // going to ignore them, so let's skip this document.
              console.log(
                `skipping, has ${nonFixableFlaws.length} non-fixable flaw(s) (${nonFixableFlawNames})`
              );
              console.groupEnd();
              countSkipped++;
              continue;
            }
          }
          const newRawHTML = $("body").html();
          if (newRawHTML !== originalRawBody) {
            Document.update(document.url, newRawHTML, document.metadata);
            console.log(`modified`);
            countModified++;
          } else {
            console.log(`no change`);
            countNoChange++;
          }
          console.groupEnd();
        }
        console.log(
          `modified: ${countModified} | no-change: ${countNoChange} | skipped: ${countSkipped} | total: ${countTotal}`
        );
      })
    );
}
