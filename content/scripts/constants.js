const path = require("path");
const assert = require("assert").strict;

require("dotenv").config({ path: process.env.ENV_FILE });

const DEFAULT_DATABASE_URL =
  process.env.DATABASE_URL || "mysql2://username:password@host/databasename";

const DEFAULT_BUILD_ROOT =
  path.join("..", process.env.BUILD_ROOT) || path.join("content", "files");

// This doesn't have a default because it's a not for everyone.
const DEFAULT_BUILD_ARCHIVE_ROOT = process.env.BUILD_ARCHIVE_ROOT;

const DEFAULT_BUILD_DESTINATION =
  process.env.BUILD_DESTINATION || path.join("client", "build");

const DEFAULT_BUILD_LOCALES = (process.env.BUILD_LOCALES || "")
  .split(",")
  .filter((x) => x);

const DEFAULT_BUILD_NOT_LOCALES = (process.env.BUILD_NOT_LOCALES || "")
  .split(",")
  .filter((x) => x);

const DEFAULT_EXCLUDE_SLUG_PREFIXES = [
  "Experiment:",
  "Help:",
  "Help_talk:",
  "Project:",
  "Project_talk:",
  "Special:",
  "Talk:",
  "Template:",
  "Template_talk:",
  "User:",
  "User_talk:",
  "Trash",

  // The following come from 'NOINDEX_SLUG_PREFIXES' in
  // https://github.com/mdn/kuma/blob/master/kuma/wiki/constants.py#L668
  // We'll have to manually maintain a match between that and this
  "MDN/Doc_status",
  "MDN/Jobs",
];

const DEFAULT_FOLDER_SEARCHES = (process.env.BUILD_FOLDER_SEARCHES || "")
  .split(",")
  .filter((x) => x);

const DEFAULT_SITEMAP_BASE_URL = "https://developer.mozilla.org";

const DEFAULT_LIVE_SAMPLES_BASE_URL =
  process.env.BUILD_LIVE_SAMPLES_BASE_URL || "https://mdn.mozillademos.org";

const DEFAULT_INTERACTIVE_EXAMPLES_BASE_URL =
  process.env.INTERACTIVE_EXAMPLES_BASE_URL ||
  "https://interactive-examples.mdn.mozilla.net";

const DEFAULT_POPULARITIES_FILEPATH =
  process.env.BUILD_POPULARITIES_FILEPATH ||
  path.join(DEFAULT_BUILD_ROOT, "..", "popularities.json");

// The Google Analytics pageviews CSV file parsed, sorted (most pageviews
// first), and sliced to this number of URIs that goes into the JSON file.
// If this number is too large the resulting JSON file gets too big and
// will include very rarely used URIs.
const MAX_GOOGLE_ANALYTICS_URIS = 20000;

// A set of every possible locale we accept content to be in.
const VALID_LOCALES = new Map(
  [
    "ar",
    "bg",
    "bm",
    "bn",
    "ca",
    "de",
    "el",
    "en-US",
    "es",
    "fa",
    "fi",
    "fr",
    "he",
    "hi-IN",
    "hu",
    "id",
    "it",
    "ja",
    "kab",
    "ko",
    "ms",
    "my",
    "nl",
    "pl",
    "pt-BR",
    "pt-PT",
    "ru",
    "sv-SE",
    "th",
    "tr",
    "uk",
    "vi",
    "zh-CN",
    "zh-TW",
  ].map((x) => [x.toLowerCase(), x])
);

const ALLOW_STALE_TITLES = JSON.parse(
  process.env.BUILD_ALLOW_STALE_TITLES || "false"
);
assert(typeof ALLOW_STALE_TITLES === "boolean");

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
  // DEFAULT_ROOT,
  // DEFAULT_ARCHIVE_ROOT,
  // DEFAULT_DESTINATION,
  DEFAULT_DATABASE_URL,
  DEFAULT_EXCLUDE_SLUG_PREFIXES,
  DEFAULT_BUILD_ROOT,
  DEFAULT_BUILD_ARCHIVE_ROOT,
  DEFAULT_BUILD_DESTINATION,
  DEFAULT_BUILD_LOCALES,
  DEFAULT_BUILD_NOT_LOCALES,
  DEFAULT_SITEMAP_BASE_URL,
  DEFAULT_LIVE_SAMPLES_BASE_URL,
  DEFAULT_INTERACTIVE_EXAMPLES_BASE_URL,
  DEFAULT_FOLDER_SEARCHES,
  DEFAULT_POPULARITIES_FILEPATH,
  ALLOW_STALE_TITLES,
  // DEFAULT_STUMPTOWN_PACKAGED_ROOT,
  MAX_GOOGLE_ANALYTICS_URIS,
  VALID_LOCALES,
  VALID_FLAW_CHECKS,
  FLAW_LEVELS,
  DEFAULT_FLAW_LEVELS,
};
