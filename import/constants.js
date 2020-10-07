const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, "..", process.env.ENV_FILE || ".env"),
});

const DATABASE_URL =
  process.env.BUILD_DATABASE_URL ||
  "mysql2://username:password@host/databasename";

const EXCLUDE_SLUG_PREFIXES = [
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
  "azsdfvg",
  "doc_temp",
  "tempjenzed",
  "Junk",
  "Temp_input",
  "Admin:groovecoder",
  "temp_gamepad",
  "temp",

  // The following come from 'NOINDEX_SLUG_PREFIXES' in
  // https://github.com/mdn/kuma/blob/master/kuma/wiki/constants.py#L668
  // We'll have to manually maintain a match between that and this
  "MDN/Doc_status",
  "MDN/Jobs",
];

const IMPORT_LOCALES = (process.env.IMPORT_LOCALES || "")
  .split(",")
  .filter((x) => x);

// The Google Analytics pageviews CSV file parsed, sorted (most pageviews
// first), and sliced to this number of URIs that goes into the JSON file.
// If this number is too large the resulting JSON file gets too big and
// will include very rarely used URIs.
const MAX_GOOGLE_ANALYTICS_URIS = 20000;

module.exports = {
  DATABASE_URL,
  EXCLUDE_SLUG_PREFIXES,
  IMPORT_LOCALES,
  MAX_GOOGLE_ANALYTICS_URIS,
};
