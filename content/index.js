const {
  CONTENT_ROOT,
  CONTENT_ARCHIVE_ROOT,
  ROOTS,
  VALID_LOCALES,
} = require("./constants");
const Document = require("./document");
const popularities = require("./popularities");
const Redirect = require("./redirect");
const { buildURL, memoize, slugToFoldername } = require("./utils");

module.exports = {
  CONTENT_ROOT,
  CONTENT_ARCHIVE_ROOT,
  ROOTS,
  VALID_LOCALES,

  popularities,

  Document,
  Redirect,

  buildURL,
  memoize,
  slugToFoldername,
};
