const path = require("path");
require("dotenv").config();

const DEFAULT_ROOT = process.env.ROOT || path.join(__dirname, "..", "files");
const DEFAULT_DESTINATION =
  process.env.ROOT || path.join(__dirname, "..", "..", "client", "build");

const DEFAULT_DATABASE_URL =
  process.env.DATABASE_URL || "mysql2://username:password@host/databasename";

const DEFAULT_BUILD_LOCALES = (process.env.BUILD_LOCALES || "")
  .split(",")
  .filter(x => x);

const DEFAULT_BUILD_NOT_LOCALES = (process.env.BUILD_NOT_LOCALES || "")
  .split(",")
  .filter(x => x);

const DEFAULT_EXCLUDE_SLUG_PREFIXES = [
  "User:",
  "Talk:",
  "User_talk:",
  "Template_talk:",
  "Project_talk:",
  "Experiment:",

  // The following come from 'NOINDEX_SLUG_PREFIXES' in
  // https://github.com/mdn/kuma/blob/master/kuma/wiki/constants.py#L668
  // We'll have to manually maintain a match between that and this
  "MDN/Doc_status",
  "MDN/Jobs"
];

const DEFAULT_FOLDER_SEARCHES = (process.env.BUILD_FOLDER_SEARCHES || "")
  .split(",")
  .filter(x => x);

const DEFAULT_SITEMAP_BASE_URL = "https://developer.mozilla.org";

const DEFAULT_POPULARITIES_FILEPATH = path.join(
  DEFAULT_ROOT,
  "..",
  "popularities.json"
);

// The Google Analytics pageviews CSV file parsed, sorted (most pageviews
// first), and sliced to this number of URIs that goes into the JSON file.
// If this number is too large the resulting JSON file gets too big and
// will include very rarely used URIs.
const MAX_GOOGLE_ANALYTICS_URIS = 20000;

// A set of every possible locale we accept content to be in.
const VALID_LOCALES = new Set([
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
  "zh-TW"
]);

module.exports = {
  DEFAULT_ROOT,
  DEFAULT_DESTINATION,
  DEFAULT_DATABASE_URL,
  DEFAULT_EXCLUDE_SLUG_PREFIXES,
  DEFAULT_BUILD_LOCALES,
  DEFAULT_BUILD_NOT_LOCALES,
  DEFAULT_SITEMAP_BASE_URL,
  DEFAULT_FOLDER_SEARCHES,
  DEFAULT_POPULARITIES_FILEPATH,
  MAX_GOOGLE_ANALYTICS_URIS,
  VALID_LOCALES
};
