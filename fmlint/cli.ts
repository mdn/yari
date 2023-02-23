#!/usr/bin/env node

import path from "node:path";
import { CliArgsAndOptions } from "./types.js";
import caporal from "@caporal/core";
import { runLinter } from "./linter.js";
import { fileURLToPath } from "node:url";
import { CONTENT_ROOT, CONTENT_TRANSLATED_ROOT } from "../libs/env/index.js";

const { program } = caporal;
const appDirectory = new URL("fmlint", import.meta.url);
const resolveApp = (relativePath) =>
  fileURLToPath(new URL(relativePath, appDirectory));

program
  .version("0.0.0")
  .option("--cwd <path>", "Explicit current-working-directory", {
    validator: program.STRING,
    default: process.cwd(),
  })
  .option("--config <path>", "Front matter config file location", {
    validator: program.STRING,
    default: resolveApp("front-matter-config.json"),
  })
  .option("--fix", "Save formatted/corrected output", {
    validator: program.BOOLEAN,
    default: false,
  })
  .argument("[files...]", "list of files and/or directories to check", {
    default: [CONTENT_ROOT, CONTENT_TRANSLATED_ROOT].filter(Boolean),
  })
  .action(({ args, options, logger }: CliArgsAndOptions) => {
    const cwd = options.cwd || process.cwd();
    const files = (args.files || []).map((f) => path.resolve(cwd, f));
    if (!files.length) {
      logger.info("No files to lint.");
      return;
    }
    return runLinter(files, options);
  });

program.run();
