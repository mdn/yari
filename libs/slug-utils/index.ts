// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'sanitizeFi... Remove this comment to see the full error message
const sanitizeFilename = require("sanitize-filename");

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'slugToFold... Remove this comment to see the full error message
function slugToFolder(slug, joiner = "/") {
  return (
    slug
      // We have slugs with these special characters that would be
      // removed by the sanitizeFilename() function. What might then
      // happen is that it leads to two *different slugs* becoming
      // *same* folder name.
      .replace(/\*/g, "_star_")
      .replace(/::/g, "_doublecolon_")
      .replace(/:/g, "_colon_")
      .replace(/\?/g, "_question_")

      .toLowerCase()
      .split("/")
      .map(sanitizeFilename)
      .join(joiner)
  );
}

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'decodePath... Remove this comment to see the full error message
function decodePath(path) {
  const decoded = path.split("/").map(decodeURIComponent).join("/");
  return decoded;
}

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'encodePath... Remove this comment to see the full error message
function encodePath(path) {
  const decoded = path.split("/").map(encodeURIComponent).join("/");
  return decoded;
}

module.exports = {
  slugToFolder,
  decodePath,
  encodePath,
};
