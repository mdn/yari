#!/usr/bin/env node
import path from "node:path";

import { ActionParameters, program } from "@caporal/core";

import { runChecker } from "./checker";
import { MAX_COMPRESSION_DIFFERENCE_PERCENTAGE } from "../libs/constants";

interface FilecheckArgsAndOptions extends ActionParameters {
  args: {
    files?: string[];
  };
  options: {
    cwd?: string;
    maxCompressionDifferencePercentage?: number;
    saveCompression?: boolean;
  };
}

program
  .version("0.0.0")
  .option("--cwd <path>", "Explicit current-working-directory", {
    validator: program.STRING,
    default: process.cwd(),
  })
  .option(
    "--max-compression-difference-percentage <amount>",
    "Max percentage for reduction after compression",
    {
      validator: program.NUMBER,
      default: MAX_COMPRESSION_DIFFERENCE_PERCENTAGE,
    }
  )
  .option("--save-compression", "If it can be compressed, save the result", {
    validator: program.BOOLEAN,
  })
  .argument("[files...]", "list of files to check")
  .action(({ args, options, logger }: FilecheckArgsAndOptions) => {
    const cwd = options.cwd || process.cwd();
    const files = (args.files || []).map((f) => path.resolve(cwd, f));

    if (!files.length) {
      logger.info("No files to check.");
      return;
    }

    return runChecker(files, options);
  });

program.run();
