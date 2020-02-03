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
  "Experiment:"
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

// The file to trigger a write too when being in watch mode
const TOUCHFILE =
  process.env.TOUCHFILE ||
  path.join(__dirname, "..", "..", "client", "src", "touchthis.js");

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
  TOUCHFILE
};
