import fs from "node:fs";

import type { Program } from "@caporal/core";
import { PathsOutput, fdir } from "fdir";
import frontmatter from "front-matter";

import { CONTENT_ROOT } from "../../libs/env/index.js";
import { tryOrExit } from "../util.js";

export function inventoryCommand(program: Program) {
  return program
    .command("inventory", "Create content inventory as JSON")
    .help(
      "In order to run the command, ensure that you have CONTENT_ROOT set in your .env file. For example: CONTENT_ROOT=/Users/steve/mozilla/mdn-content/files"
    )
    .action(
      tryOrExit(async () => {
        if (!CONTENT_ROOT) {
          throw new Error(
            "CONTENT_ROOT not set. Please run yarn tool inventory --help for more information."
          );
        }

        const crawler = new fdir()
          .withFullPaths()
          .withErrors()
          .filter((filePath) => filePath.endsWith(".md"))
          .crawl(CONTENT_ROOT);
        const paths = (await crawler.withPromise()) as PathsOutput;

        const inventory = paths.map((path) => {
          const fileContents = fs.readFileSync(path, "utf-8");
          const parsed = frontmatter(fileContents);

          return {
            path: path.substring(path.indexOf("/files")),
            frontmatter: parsed.attributes,
          };
        });

        process.stdout.write(JSON.stringify(inventory, undefined, 2));
      })
    );
}
