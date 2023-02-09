import fs from "node:fs";
import path from "node:path";

import type { ActionParameters, Program } from "@caporal/core";
import chalk from "chalk";

import { tryOrExit } from "../util.js";
import { CONTENT_ROOT, CONTENT_TRANSLATED_ROOT } from "../../libs/env/index.js";
import { gatherGitHistory } from "../../build/index.js";
import { isValidLocale } from "../../libs/locale-utils/index.js";
import { getRoot } from "../../content/index.js";

interface GatherGitHistoryActionParameters extends ActionParameters {
  options: {
    saveHistory: string;
    loadHistory: string;
    verbose: boolean;
  };
}

export function gatherGitHistoryCommand(program: Program) {
  return program
    .command(
      "gather-git-history",
      "Extract all last-modified dates from the git logs"
    )
    .option("--save-history <path>", "File to save all previous history")
    .option(
      "--load-history <path>",
      "Optional file to load all previous history"
    )
    .action(
      tryOrExit(async ({ options }: GatherGitHistoryActionParameters) => {
        const { saveHistory, loadHistory, verbose } = options;
        if (loadHistory) {
          if (fs.existsSync(loadHistory)) {
            console.log(
              chalk.yellow(`Reusing existing history from ${loadHistory}`)
            );
          }
        }
        const roots = [CONTENT_ROOT];
        if (CONTENT_TRANSLATED_ROOT) {
          roots.push(CONTENT_TRANSLATED_ROOT);
        }
        const map = gatherGitHistory(
          roots,
          loadHistory && fs.existsSync(loadHistory) ? loadHistory : null
        );
        const historyPerLocale = {};

        // Someplace to put the map into an object so it can be saved into `saveHistory`
        const allHistory = {};
        for (const [relPath, value] of map) {
          const locale = relPath.split(path.sep)[0];
          if (!isValidLocale(locale)) {
            continue;
          }
          allHistory[relPath] = value;
          if (!historyPerLocale[locale]) {
            historyPerLocale[locale] = {};
          }
          historyPerLocale[locale][relPath] = value;
        }
        let filesWritten = 0;
        for (const [locale, history] of Object.entries(historyPerLocale)) {
          const root = getRoot(locale);
          const outputFile = path.join(root, locale, "_githistory.json");
          fs.writeFileSync(
            outputFile,
            JSON.stringify(history, null, 2),
            "utf-8"
          );
          filesWritten += 1;
          if (verbose) {
            console.log(
              chalk.green(
                `Wrote '${locale}' ${Object.keys(
                  history
                ).length.toLocaleString()} paths into ${outputFile}`
              )
            );
          }
        }
        console.log(
          chalk.green(`Wrote ${filesWritten} _githistory.json files`)
        );
        if (saveHistory) {
          fs.writeFileSync(
            saveHistory,
            JSON.stringify(allHistory, null, 2),
            "utf-8"
          );
          console.log(
            chalk.green(
              `Saved ${Object.keys(
                allHistory
              ).length.toLocaleString()} paths into ${saveHistory}`
            )
          );
        }
      })
    );
}
