const path = require("path");

const {
  CONTENT_ROOT,
  CONTENT_ARCHIVE_ROOT,
  ROOTS,
  VALID_LOCALES,
} = require("./constants");
const Document = require("./document");
const Redirect = require("./redirect");
const { buildURL, memoize, slugToFoldername } = require("./utils");

module.exports = {
  CONTENT_ROOT,
  CONTENT_ARCHIVE_ROOT,
  ROOTS,
  VALID_LOCALES,

  Document,
  Redirect,

  buildURL,
  memoize,
  slugToFoldername,
};
