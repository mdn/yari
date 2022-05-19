// @ts-expect-error ts-migrate(6200) FIXME: Definitions of the following identifiers conflict ... Remove this comment to see the full error message
const path = require("path");

const dotenv = require("dotenv");
const dirname = __dirname;
dotenv.config({
  path: path.join(dirname, "..", process.env.ENV_FILE || ".env"),
});

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'BUILD_OUT_... Remove this comment to see the full error message
const BUILD_OUT_ROOT =
  process.env.BUILD_OUT_ROOT || path.join(dirname, "..", "client", "build");

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'FLAW_LEVEL... Remove this comment to see the full error message
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
  "bad_bcd_links",
  "images",
  "image_widths",
  "bad_pre_tags",
  "sectioning",
  "heading_links",
  "translation_differences",
  "unsafe_html",
]);

// TODO (far future): Switch to "error" when number of flaws drops.
const DEFAULT_FLAW_LEVELS = process.env.BUILD_FLAW_LEVELS || "*:warn";

const FILES = process.env.BUILD_FILES || "";
const FOLDERSEARCH = process.env.BUILD_FOLDERSEARCH || "";
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'GOOGLE_ANA... Remove this comment to see the full error message
const GOOGLE_ANALYTICS_ACCOUNT =
  process.env.BUILD_GOOGLE_ANALYTICS_ACCOUNT || "";
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'GOOGLE_ANA... Remove this comment to see the full error message
const GOOGLE_ANALYTICS_DEBUG = JSON.parse(
  process.env.BUILD_GOOGLE_ANALYTICS_DEBUG || "false"
);
const NO_PROGRESSBAR = Boolean(
  JSON.parse(process.env.BUILD_NO_PROGRESSBAR || process.env.CI || "false")
);
const FIX_FLAWS = JSON.parse(process.env.BUILD_FIX_FLAWS || "false");
const FIX_FLAWS_DRY_RUN = JSON.parse(
  process.env.BUILD_FIX_FLAWS_DRY_RUN || "false"
);
const FIX_FLAWS_TYPES = new Set(
  (process.env.BUILD_FIX_FLAWS_TYPES &&
    process.env.BUILD_FIX_FLAWS_TYPES.split(",")) || [...VALID_FLAW_CHECKS]
);

if ([...FIX_FLAWS_TYPES].some((flawType) => !VALID_FLAW_CHECKS.has(flawType))) {
  throw new Error(
    `Env var BUILD_FIX_FLAWS_TYPES must be a subset of ${[
      ...VALID_FLAW_CHECKS.values(),
    ].join(",")}`
  );
}

const FIX_FLAWS_VERBOSE = JSON.parse(
  // It's on by default because it's such a sensible option to always have
  // on.
  process.env.BUILD_FIX_FLAWS_VERBOSE || "true"
);

// See explanation in docs/envvars.md
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'ALWAYS_ALL... Remove this comment to see the full error message
const ALWAYS_ALLOW_ROBOTS = JSON.parse(
  process.env.BUILD_ALWAYS_ALLOW_ROBOTS || "false"
);

module.exports = {
  BUILD_OUT_ROOT,
  DEFAULT_FLAW_LEVELS,
  FILES,
  FLAW_LEVELS,
  FOLDERSEARCH,
  GOOGLE_ANALYTICS_ACCOUNT,
  GOOGLE_ANALYTICS_DEBUG,
  NO_PROGRESSBAR,
  VALID_FLAW_CHECKS,
  FIX_FLAWS,
  FIX_FLAWS_DRY_RUN,
  FIX_FLAWS_TYPES,
  FIX_FLAWS_VERBOSE,
  ALWAYS_ALLOW_ROBOTS,
};
