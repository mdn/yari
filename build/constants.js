const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, "..", process.env.ENV_FILE || ".env"),
});

const FLAW_LEVELS = Object.freeze({
  ERROR: "error",
  IGNORE: "ignore",
  WARN: "warn",
});

// These names need to match what we have in the code where we have various
// blocks of code that look something like this:
//
//    if (this.options.flawChecks.profanities) {
//      ... analyze and possible add to doc.flaws.profanities ...
//
// This list needs to be synced with the code. And the CLI arguments
// used with --flaw-checks needs to match this set.
const VALID_FLAW_CHECKS = new Set([
  "macros",
  "broken_links",
  "bad_bcd_queries",
]);

// TODO (far future): Switch to "error" when number of flaws drops.
const DEFAULT_FLAW_LEVELS = process.env.BUILD_FLAW_LEVELS || "*:warn";

const FILES = process.env.BUILD_FILES || "";
const FOLDERSEARCH = process.env.BUILD_FOLDERSEARCH || "";
const NO_PROGRESSBAR = Boolean(
  JSON.parse(process.env.BUILD_NO_PROGRESSBAR || process.env.CI || "false")
);

module.exports = {
  DEFAULT_FLAW_LEVELS,
  FILES,
  FLAW_LEVELS,
  FOLDERSEARCH,
  NO_PROGRESSBAR,
  VALID_FLAW_CHECKS,
};
