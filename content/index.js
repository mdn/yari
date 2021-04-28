const {
  CONTENT_ROOT,
  CONTENT_ARCHIVED_ROOT,
  CONTENT_TRANSLATED_ROOT,
  REPOSITORY_URLS,
  ROOTS,
  VALID_LOCALES,
} = require("./constants");
const Document = require("./document");
const Translation = require("./translation");
const { getPopularities } = require("./popularities");
const Redirect = require("./redirect");
const Image = require("./image");
const Archive = require("./archive");
const {
  buildURL,
  memoize,
  slugToFolder,
  execGit,
  getRoot,
} = require("./utils");
const { resolveFundamental } = require("../libs/fundamental-redirects");
const { translationsOf } = require("./translations");

module.exports = {
  CONTENT_ROOT,
  CONTENT_ARCHIVED_ROOT,
  CONTENT_TRANSLATED_ROOT,
  REPOSITORY_URLS,
  ROOTS,
  VALID_LOCALES,

  getPopularities,

  Document,
  Redirect,
  Image,
  Archive,
  Translation,

  buildURL,
  memoize,
  slugToFolder,
  resolveFundamental,
  execGit,
  translationsOf,
  getRoot,
};
