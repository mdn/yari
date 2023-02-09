import fs from "node:fs";
import path from "node:path";

import type { ActionParameters, Program } from "@caporal/core";
import chalk from "chalk";

import {
  BUILD_OUT_ROOT,
  GOOGLE_ANALYTICS_ACCOUNT,
  GOOGLE_ANALYTICS_DEBUG,
} from "../../libs/env/index.js";
import { tryOrExit } from "../util.js";

interface GoogleAnalyticsCodeActionParameters extends ActionParameters {
  options: {
    account: string;
    debug: boolean;
    outfile: string;
  };
}

export function googleAnalyticsCodeCommand(program: Program) {
  return program
    .command(
      "google-analytics-code",
      "Generate a .js file that can be used in SSR rendering"
    )
    .option("--outfile <path>", "name of the generated script file", {
      default: path.join(BUILD_OUT_ROOT, "static", "js", "ga.js"),
    })
    .option(
      "--debug",
      "whether to use the Google Analytics debug file (defaults to value of $GOOGLE_ANALYTICS_DEBUG)",
      {
        default: GOOGLE_ANALYTICS_DEBUG,
      }
    )
    .option(
      "--account <id>",
      "Google Analytics account ID (defaults to value of $GOOGLE_ANALYTICS_ACCOUNT)",
      {
        default: GOOGLE_ANALYTICS_ACCOUNT,
      }
    )
    .action(
      tryOrExit(
        async ({ options, logger }: GoogleAnalyticsCodeActionParameters) => {
          const { outfile, debug, account } = options;
          if (account) {
            const dntHelperCode = fs
              .readFileSync(
                new URL("mozilla.dnthelper.min.js", import.meta.url),
                "utf-8"
              )
              .trim();

            const gaScriptURL = `https://www.google-analytics.com/${
              debug ? "analytics_debug" : "analytics"
            }.js`;

            const code = `
// Mozilla DNT Helper
${dntHelperCode}
// only load GA if DNT is not enabled
if (Mozilla && !Mozilla.dntEnabled()) {
    window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date;
    ga('create', '${account}', 'mozilla.org');
    ga('set', 'anonymizeIp', true);
    ga('send', 'pageview');

    var gaScript = document.createElement('script');
    gaScript.async = 1; gaScript.src = '${gaScriptURL}';
    document.head.appendChild(gaScript);
}`.trim();
            fs.writeFileSync(outfile, `${code}\n`, "utf-8");
            logger.info(
              chalk.green(
                `Generated ${outfile} for SSR rendering using ${account}${
                  debug ? " (debug mode)" : ""
                }.`
              )
            );
          } else {
            logger.info(
              chalk.yellow("No Google Analytics code file generated")
            );
          }
        }
      )
    );
}
