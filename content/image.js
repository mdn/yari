const fs = require("fs");
const path = require("path");

const readChunk = require("read-chunk");
const imageType = require("image-type");
const isSvg = require("is-svg");

const { ROOTS } = require("./constants");
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

module.exports = {
  findByURL,
};
