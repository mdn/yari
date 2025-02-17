// Ensure environment variables are read.
import "../config/env.js";

import chalk from "chalk";
import fs from "fs-extra";
import webpack from "webpack";

import configFactory from "../config/webpack.config.js";
import paths from "../config/paths.js";

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on("unhandledRejection", (err) => {
  throw err;
});

// Generate configuration
const config = configFactory("production");

// Remove all content but keep the directory so that
// if you're in it, you don't end up in Trash
fs.emptyDirSync(paths.appBuild);
// Merge with the public folder
copyPublicFolder();
// Start the webpack build
build()
  .then(
    (stats) => {
      console.log(stats);
    },
    (err) => {
      console.log(chalk.red("Failed to compile.\n"));
      console.log(err);
      process.exit(1);
    }
  )
  .catch((err) => {
    if (err && err.message) {
      console.log(err.message);
    }
    process.exit(1);
  });

// Create the production build
function build() {
  console.log("Creating an optimized production build...");

  const compiler = webpack(config);
  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) {
        if (!err.message) {
          return reject(err);
        }

        let errMessage = err.message;

        // Add additional information for postcss errors
        if (Object.prototype.hasOwnProperty.call(err, "postcssNode")) {
          errMessage +=
            "\nCompileError: Begins at CSS selector " +
            err["postcssNode"].selector;
        }

        return reject(errMessage);
      }
      if (stats.hasErrors()) {
        return reject(
          stats.toString({ all: false, colors: true, errors: true })
        );
      }
      if (
        process.env.CI &&
        (typeof process.env.CI !== "string" ||
          process.env.CI.toLowerCase() !== "false") &&
        stats.hasWarnings()
      ) {
        console.log(
          chalk.yellow(
            "\nTreating warnings as errors because process.env.CI = true.\n" +
              "Most CI servers set it automatically.\n"
          )
        );
        return reject(stats.toString({ all: false, warnings: true }));
      }

      return resolve(stats.toString({ colors: true, warnings: true }));
    });
  });
}

function copyPublicFolder() {
  fs.copySync(paths.appPublic, paths.appBuild, {
    dereference: true,
    filter: (file) => file !== paths.appHtml,
  });
}
