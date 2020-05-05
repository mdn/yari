const path = require("path");
require("dotenv").config();

// const DEFAULT_ROOT = process.env.BUILD_ROOT;

// const DEFAULT_ARCHIVE_ROOT = process.env.ARCHIVE_ROOT ||
//   path.join(__dirname, "..", "..", "archivecontent", "files");
// const DEFAULT_DESTINATION =
//   process.env.ROOT || path.join(__dirname, "..", "..", "client", "build");

const DEFAULT_DATABASE_URL =
  process.env.DATABASE_URL || "mysql2://username:password@host/databasename";

const DEFAULT_BUILD_LOCALES = (process.env.BUILD_LOCALES || "")
  .split(",")
  .filter((x) => x);

const DEFAULT_BUILD_NOT_LOCALES = (process.env.BUILD_NOT_LOCALES || "")
  .split(",")
  .filter((x) => x);

// const DEFAULT_STUMPTOWN_PACKAGED_ROOT =
//   process.env.STUMPTOWN_PACKAGED_ROOT ||
//   path.join(__dirname, "..", "..", "stumptown", "packaged");

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

  // The following come from 'NOINDEX_SLUG_PREFIXES' in
  // https://github.com/mdn/kuma/blob/master/kuma/wiki/constants.py#L668
  // We'll have to manually maintain a match between that and this
  "MDN/Doc_status",
  "MDN/Jobs",
];

const DEFAULT_FOLDER_SEARCHES = (process.env.BUILD_FOLDER_SEARCHES || "")
  .split(",")
  .filter((x) => x);

const DEFAULT_FLAW_CHECKS = (process.env.BUILD_FLAW_CHECKS || "")
  .split(",")
  .filter((x) => x);

// These names need to match what we have in the code where we have various
// blocks of code that look something like this:
//
//    if (this.options.flawChecks.profanities) {
//      ... analyze and possible add to doc.flaws.profanities ...
//
// This list needs to be synced with the code. And the CLI arguments
// used with --flaw-checks needs to match this set.
const VALID_FLAW_CHECKS = new Set(["broken_links", "bad_bcd_queries"]);

const DEFAULT_SITEMAP_BASE_URL = "https://developer.mozilla.org";

const DEFAULT_POPULARITIES_FILEPATH =
  process.env.BUILD_POPULARITIES_FILEPATH ||
  path.join(process.env.BUILD_ROOT, "..", "popularities.json");

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

module.exports = {
  // DEFAULT_ROOT,
  // DEFAULT_ARCHIVE_ROOT,
  // DEFAULT_DESTINATION,
  DEFAULT_DATABASE_URL,
  DEFAULT_EXCLUDE_SLUG_PREFIXES,
  DEFAULT_BUILD_LOCALES,
  DEFAULT_BUILD_NOT_LOCALES,
  DEFAULT_SITEMAP_BASE_URL,
  DEFAULT_FOLDER_SEARCHES,
  DEFAULT_POPULARITIES_FILEPATH,
  // DEFAULT_STUMPTOWN_PACKAGED_ROOT,
  MAX_GOOGLE_ANALYTICS_URIS,
  VALID_LOCALES,
  DEFAULT_FLAW_CHECKS,
  VALID_FLAW_CHECKS,
};
