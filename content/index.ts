const {
  // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'CONTENT_RO... Remove this comment to see the full error message
  CONTENT_ROOT,
  // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'CONTENT_TR... Remove this comment to see the full error message
  CONTENT_TRANSLATED_ROOT,
  // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'CONTRIBUTO... Remove this comment to see the full error message
  CONTRIBUTOR_SPOTLIGHT_ROOT,
  // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'REPOSITORY... Remove this comment to see the full error message
  REPOSITORY_URLS,
  // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'ROOTS'.
  ROOTS,
  // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'VALID_LOCA... Remove this comment to see the full error message
  VALID_LOCALES,
  // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'HTML_FILEN... Remove this comment to see the full error message
  HTML_FILENAME,
  // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'MARKDOWN_F... Remove this comment to see the full error message
  MARKDOWN_FILENAME,
} = require("./constants");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'Document'.
const Document = require("./document");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'Translatio... Remove this comment to see the full error message
const Translation = require("./translation");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'getPopular... Remove this comment to see the full error message
const { getPopularities } = require("./popularities");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'Redirect'.
const Redirect = require("./redirect");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'Image'.
const Image = require("./image");
const {
  // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'buildURL'.
  buildURL,
  // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'memoize'.
  memoize,
  // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'slugToFold... Remove this comment to see the full error message
  slugToFolder,
  // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'execGit'.
  execGit,
  // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'getRoot'.
  getRoot,
} = require("./utils");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'resolveFun... Remove this comment to see the full error message
const { resolveFundamental } = require("../libs/fundamental-redirects");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'translatio... Remove this comment to see the full error message
const { translationsOf } = require("./translations");

module.exports = {
  CONTENT_ROOT,
  CONTENT_TRANSLATED_ROOT,
  CONTRIBUTOR_SPOTLIGHT_ROOT,
  REPOSITORY_URLS,
  ROOTS,
  VALID_LOCALES,
  HTML_FILENAME,
  MARKDOWN_FILENAME,

  getPopularities,

  Document,
  Redirect,
  Image,
  Translation,

  buildURL,
  memoize,
  slugToFolder,
  resolveFundamental,
  execGit,
  translationsOf,
  getRoot,
};
