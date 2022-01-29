const fs = require("fs");
const path = require("path");

const readChunk = require("read-chunk");
const imageType = require("image-type");
const isSvg = require("is-svg");

const { ROOTS, DEFAULT_LOCALE } = require("./constants");
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

function findByURL(url) {
  return find(urlToFilePath(url));
}

function findByURLWithFallback(url) {
  let filePath = findByURL(url);
  const locale = url.split("/")[1].toLowerCase();
  if (
    !filePath &&
    locale !== DEFAULT_LOCALE &&
    !url.startsWith(`/${DEFAULT_LOCALE.toLowerCase()}/`)
  ) {
    let defaultLocaleURL = url.replace(
      new RegExp(`^/${locale}/`, "i"),
      `/${DEFAULT_LOCALE}/`
    );
    filePath = findByURL(defaultLocaleURL);
  }
  return filePath;
}

module.exports = {
  findByURL,
  findByURLWithFallback,
};
