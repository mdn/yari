import fm from "front-matter";
import caporal from "@caporal/core";
import chalk from "chalk";
import { Document } from "../../content/index.js";
import { saveFile } from "../../content/document.js";
import { VALID_LOCALES } from "../../libs/constants/index.js";

import { m2h } from "./index.js";
import { Locale } from "../../libs/types/core.js";

const { program } = caporal;

interface CliOptions {
  v?: boolean;
  verbose?: boolean;
}

function tryOrExit(f: ({ options, ...args }) => Promise<void>) {
  return async ({ options = {}, ...args }: { options: CliOptions }) => {
    try {
      await f({ options, ...args });
    } catch (error) {
      if (error instanceof Error && (options.verbose || options.v)) {
        console.error(chalk.red(error.stack));
      }
      throw error;
    }
  };
}

function buildLocaleMap(locale: string) {
  let localesMap = new Map<string, string>();
  if (locale !== "all") {
    localesMap = new Map([[locale.toLowerCase(), locale]]);
  }
  return localesMap;
}

program
  .bin("yarn m2h")
  .name("m2h")
  .version("0.0.1")
  .disableGlobalOption("--silent")
  .cast(false)

  .option("--locale", "Targets a specific locale", {
    default: "all",
    validator: Array.from(VALID_LOCALES.values()).concat("all" as Locale),
  })
  .argument("[folder]", "convert by folder")
  .action(
    tryOrExit(async ({ args, options }) => {
      const all = await Document.findAll({
        folderSearch: args.folder,
        locales: buildLocaleMap(options.locale),
      });
      for (const doc of all.iterDocs()) {
        if (!doc.isMarkdown) {
          continue;
        }
        const { body: m, attributes: metadata } = fm(doc.rawContent);
        const h = await m2h(m, { locale: doc.metadata.locale });
        saveFile(doc.fileInfo.path.replace(/\.md$/, ".html"), h, metadata);
      }
    })
  );

program.run();
