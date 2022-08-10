import * as fs from "fs";
import * as os from "os";
import * as path from "path";
const fm = require("front-matter");
import { program } from "@caporal/core";
import * as chalk from "chalk";
import * as cliProgress from "cli-progress";
import { Document } from "../../content";
import { saveFile } from "../../content/document";
import { VALID_LOCALES } from "../../libs/constants";
import { execGit } from "../../content";
import { getRoot } from "../../content/utils";

const { prettyAST } = require("../utils");
import { m2h } from "./index.js";

function tryOrExit(f) {
  return async ({
    options = {},
    ...args
  }: {
    options: { verbose?: boolean; v?: boolean };
  }) => {
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
  .bin("yarn m2h")
  .name("m2h")
  .version("0.0.1")
  .disableGlobalOption("--silent")
  .cast(false)

  .option("--locale", "Targets a specific locale", {
    default: "all",
    validator: (Array.from(VALID_LOCALES.values()) as string[]).concat("all"),
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
