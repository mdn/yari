const path = require("path");

require("dotenv").config({ path: process.env.ENV_FILE || "../.env" });

const FLAW_LEVELS = Object.freeze({
  WARN: "warn",
  IGNORE: "ignore",
  ERROR: "error",
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

module.exports = {
  VALID_FLAW_CHECKS,
  FLAW_LEVELS,
  DEFAULT_FLAW_LEVELS,
};
