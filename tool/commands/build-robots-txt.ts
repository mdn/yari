/**
 * This script generates a /robots.txt file that depends on
 * process.env.BUILD_ALWAYS_ALLOW_ROBOTS.
 *
 */
import fs from "node:fs";
import path from "node:path";

import type { ActionParameters, Logger, Program } from "@caporal/core";
import chalk from "chalk";

import { VALID_LOCALES } from "../../libs/constants/index.js";
import { ALWAYS_ALLOW_ROBOTS, BUILD_OUT_ROOT } from "../../libs/env/index.js";
import { tryOrExit } from "../util.js";

const ALLOW_TEXT = `
User-agent: *
Sitemap: https://developer.mozilla.org/sitemap.xml

Disallow: /api/
Disallow: /*/files/
Disallow: /media
`;

const DISALLOW_TEXT = `
User-Agent: *

Disallow: /
`;

interface BuildRobotsTxtActionParameters extends ActionParameters {
  options: {
    outfile: string;
    maxUris: number;
    refresh: boolean;
  };
  logger: Logger;
}

export function buildRobotsTxtCommand(program: Program) {
  return program
    .command(
      "build-robots-txt",
      "Generate a robots.txt in the build root depending ALWAYS_ALLOW_ROBOTS"
    )
    .option("--outfile <path>", "name of the generated file", {
      default: path.join(BUILD_OUT_ROOT, "robots.txt"),
    })
    .action(
      tryOrExit(async ({ options, logger }: BuildRobotsTxtActionParameters) => {
        const { outfile } = options;
        await runBuildRobotsTxt(outfile);
        logger.info(
          chalk.yellow(
            `Generated ${path.relative(
              ".",
              outfile
            )} based on ALWAYS_ALLOW_ROBOTS=${ALWAYS_ALLOW_ROBOTS}`
          )
        );
      })
    );
}

async function runBuildRobotsTxt(outfile: string) {
  let content = ALWAYS_ALLOW_ROBOTS ? ALLOW_TEXT : DISALLOW_TEXT;
  if (ALWAYS_ALLOW_ROBOTS) {
    // Append extra lines specifically when we do allow robots.
    for (const locale of VALID_LOCALES.values()) {
      content += `Disallow: /${locale}/search\n`;
    }
  }
  fs.writeFileSync(outfile, `${content.trim()}\n`, "utf-8");
}
