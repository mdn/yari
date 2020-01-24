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

// If you're parsing the Google Analytics pageviews CSV file, you'll see
// that there are a LOT of pages that only have tiny amount of pageviews.
// Eliminating some of the really small counts we can save on some
// processing time and memory.
//
// An analyzes of MDN as of November 2019 indicates that approximately...
//   ~40% have [,10] pageviews
//   ~8%  have (10,5] pageviews
//   ~4%  have (5,3] pageviews
//   ~40% have (1,0] pageviews   (ie. ~40% only have 1 pageview)
//
// Anything *smaller* than this number gets ignored.
const MIN_GOOGLE_ANALYTICS_PAGEVIEWS = parseInt(
  process.env.MIN_GOOGLE_ANALYTICS_PAGEVIEWS || "2"
);

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
  MIN_GOOGLE_ANALYTICS_PAGEVIEWS,
  TOUCHFILE
};
