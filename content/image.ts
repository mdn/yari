// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'fs'.
const fs = require("fs");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'path'.
const path = require("path");

const readChunk = require("read-chunk");
const imageType = require("image-type");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'isSvg'.
const isSvg = require("is-svg");

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'ROOTS'.
const { ROOTS, DEFAULT_LOCALE } = require("./constants");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'memoize'.
const { memoize, slugToFolder } = require("./utils");

function isImage(filePath) {
  if (fs.statSync(filePath).isDirectory()) {
    return false;
  }
  if (filePath.toLowerCase().endsWith(".svg")) {
    return isSvg(fs.readFileSync(filePath));
  }

  const buffer = readChunk.sync(filePath, 0, 12);
  if (buffer.length === 0) {
    return false;
  }
  const type = imageType(buffer);
  if (!type) {
    // This happens when there's no match on the "Supported file types"
    // https://github.com/sindresorhus/image-type#supported-file-types
    return false;
  }

  return true;
}

function urlToFilePath(url) {
  const [, locale, , ...slugParts] = decodeURI(url).split("/");
  return path.join(locale.toLowerCase(), slugToFolder(slugParts.join("/")));
}

const find = memoize((relativePath) => {
  return ROOTS.map((root) => path.join(root, relativePath)).find(
    (filePath) => fs.existsSync(filePath) && isImage(filePath)
  );
});

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'findByURL'... Remove this comment to see the full error message
function findByURL(url) {
  return find(urlToFilePath(url));
}

function findByURLWithFallback(url) {
  let filePath = findByURL(url);
  const urlParts = url.split("/");
  const locale = urlParts[1].toLowerCase();
  if (!filePath && locale !== DEFAULT_LOCALE) {
    urlParts[1] = DEFAULT_LOCALE;
    const defaultLocaleURL = urlParts.join("/");
    filePath = findByURL(defaultLocaleURL);
  }
  return filePath;
}

module.exports = {
  findByURL,
  findByURLWithFallback,
};
