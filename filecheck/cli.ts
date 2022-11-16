#!/usr/bin/env node
import path from "path";

import { program } from "@caporal/core";

import { runChecker } from "./checker";
import { MAX_COMPRESSION_DIFFERENCE_PERCENTAGE } from "../libs/constants";

interface FilecheckArgsAndOptions {
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
    default: path.join(process.cwd(), ".."),
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
  .action(({ args, options }: FilecheckArgsAndOptions) => {
    const cwd = options.cwd || process.cwd();
    const allFilePaths = (args.files || []).map((f) => path.resolve(cwd, f));
    if (!allFilePaths.length) {
      throw new Error("no files to check");
    }
    return runChecker(allFilePaths, options).catch((error) => {
      console.error(error);
      throw error;
    });
  });

program.run();
