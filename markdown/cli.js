import fm from "front-matter";
import { createRequire } from "module";
import chalk from "chalk";
import { Document } from "../content/index.js";
import { saveFile } from "../content/document.js";
import { VALID_LOCALES } from "../libs/constants/index.js";

import { m2h } from "./m2h/index.js";

const require = createRequire(import.meta.url);
const { program } = require("@caporal/core");

function tryOrExit(f) {
  return async ({ options = {}, ...args }) => {
    try {
      await f({ options, ...args });
    } catch (error) {
      if (options.verbose || options.v) {
        console.error(chalk.red(error.stack));
      }
      throw error;
    }
  };
}

function buildLocaleMap(locale) {
  let localesMap = new Map();
  if (locale !== "all") {
    localesMap = new Map([[locale.toLowerCase(), locale]]);
  }
  return localesMap;
}

program
  .bin("yarn md")
  .name("md")
  .version("0.0.1")
  .disableGlobalOption("--silent")
  .cast(false)
  .command("m2h", "Convert Markdown to HTML")
  .option("--locale", "Targets a specific locale", {
    default: "all",
    validator: Array.from(VALID_LOCALES.values()).concat("all"),
  })
  .argument("[folder]", "convert by folder")
  .action(
    tryOrExit(async ({ args, options }) => {
      const all = Document.findAll({
        folderSearch: args.folder,
        locales: buildLocaleMap(options.locale),
      });
      for (let doc of all.iter()) {
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
