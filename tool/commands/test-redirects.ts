import type { ActionParameters, Program } from "@caporal/core";
import chalk from "chalk";

import { tryOrExit } from "../util.js";
import { Redirect } from "../../content/index.js";

interface TestRedirectsActionParameters extends ActionParameters {
  args: {
    urls: string[];
  };
}

export function testRedirectsCommand(program: Program) {
  return program
    .command("test-redirects", "Test URLs (pathnames) to see if they redirect")
    .argument("[urls...]", "URLs to test")
    .action(
      tryOrExit(({ args, logger }: TestRedirectsActionParameters) => {
        for (const url of args.urls) {
          const resolved = Redirect.resolve(url);
          if (resolved === url) {
            logger.info(
              chalk.yellow(`${url.padEnd(50)} Not a redirecting URL`)
            );
          } else {
            logger.info(chalk.green(`${url.padEnd(50)} -> ${resolved}`));
          }
        }
      })
    );
}
