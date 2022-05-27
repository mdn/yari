const fs = require("fs");
const path = require("path");

const dotenv = require("dotenv");
const dirname = __dirname;
dotenv.config({
  path: path.join(dirname, "..", "..", process.env.ENV_FILE || ".env"),
});

// -----
// build
// -----

const BUILD_OUT_ROOT =
  process.env.BUILD_OUT_ROOT ||
  path.join(dirname, "..", "..", "client", "build");

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
const GOOGLE_ANALYTICS_ACCOUNT =
  process.env.BUILD_GOOGLE_ANALYTICS_ACCOUNT || "";
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
const ALWAYS_ALLOW_ROBOTS = JSON.parse(
  process.env.BUILD_ALWAYS_ALLOW_ROBOTS || "false"
);

// -------
// content
// -------

const CONTENT_ROOT = correctContentPathFromEnv("CONTENT_ROOT");
if (!CONTENT_ROOT) {
  throw new Error("Env var CONTENT_ROOT must be set");
}

const CONTENT_TRANSLATED_ROOT = correctContentPathFromEnv(
  "CONTENT_TRANSLATED_ROOT"
);

const CONTRIBUTOR_SPOTLIGHT_ROOT = correctContentPathFromEnv(
  "CONTRIBUTOR_SPOTLIGHT_ROOT"
);

// This makes it possible to know, give a root folder, what is the name of
// the repository on GitHub.
// E.g. `'https://github.com/' + REPOSITORY_URLS[document.fileInfo.root]`
const REPOSITORY_URLS = {
  [CONTENT_ROOT]: "mdn/content",
};

// Make a combined array of all truthy roots. This way, you don't
// need to constantly worry about CONTENT_TRANSLATED_ROOT potentially being
// null.
const ROOTS = [CONTENT_ROOT];
if (CONTENT_TRANSLATED_ROOT) {
  ROOTS.push(CONTENT_TRANSLATED_ROOT);
  REPOSITORY_URLS[CONTENT_TRANSLATED_ROOT] = "mdn/translated-content";
}

const HTML_FILENAME = "index.html";
const MARKDOWN_FILENAME = "index.md";

function correctContentPathFromEnv(envVarName) {
  let pathName = process.env[envVarName];
  if (!pathName) {
    return;
  }
  pathName = fs.realpathSync(pathName);
  if (
    path.basename(pathName) !== "files" &&
    fs.existsSync(path.join(pathName, "files"))
  ) {
    // It can be "corrected"
    pathName = path.join(pathName, "files");
    console.warn(
      `Corrected the ${envVarName} environment variable to ${pathName}`
    );
  } else if (!fs.existsSync(pathName)) {
    throw new Error(`${path.resolve(pathName)} does not exist`);
  }
  return pathName;
}

module.exports = {
  // build
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
  // content
  CONTENT_ROOT,
  CONTENT_TRANSLATED_ROOT,
  CONTRIBUTOR_SPOTLIGHT_ROOT,
  REPOSITORY_URLS,
  ROOTS,
  HTML_FILENAME,
  MARKDOWN_FILENAME,
};
