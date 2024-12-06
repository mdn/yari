#!/usr/bin/env node
import caporal from "@caporal/core";

import { SENTRY_DSN_BUILD } from "../libs/env/index.js";
import { initSentry } from "./sentry.js";
import { ssrAllDocuments } from "./ssr.js";

const { program } = caporal;

if (SENTRY_DSN_BUILD) {
  initSentry(SENTRY_DSN_BUILD);
}

program
  .option("-s, --skip-docs", "Do not build docs (only spas, blog...)", {
    default: false,
  })
  .action(async ({ options }) => {
    await ssrAllDocuments({ skipDocs: Boolean(options?.skipDocs) });
  });

program.run();
