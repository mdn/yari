import path from "path";

import program from "@caporal/core";

import { runChecker } from "./checker.mjs";
import { MAX_COMPRESSION_DIFFERENCE_PERCENTAGE } from "./constants.mjs";

program.default
  .version("0.0.0")
  .option("--cwd <path>", "Explicit current-working-directory", {
    validator: program.PATH,
    default: path.join(process.cwd(), ".."),
  })
  .option(
    "--max-compression-difference-percentage <amount>",
    "Max percentage for reduction after compression",
    { validator: program.FLOAT, default: MAX_COMPRESSION_DIFFERENCE_PERCENTAGE }
  )
  .option("--save-compression", "If it can be compressed, save the result", {
    validator: program.BOOL,
  })
  .argument("[files...]", "list of files to check")
  .action(({ args, options }) => {
    const cwd = options.cwd || process.cwd();
    const allFilePaths = (args.files || []).map((f) => path.resolve(cwd, f));
    if (!allFilePaths.length) {
      throw new Error("no files to check");
    }
    return runChecker(allFilePaths, options).catch((error) => {
      console.error(error);
      // eslint-disable-next-line no-process-exit
      process.exit(1);
    });
  });

program.default.run();
