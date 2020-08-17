const fs = require("fs");
const path = require("path");

const { ROOTS } = require("./constants");
const { memoize, slugToFolder } = require("./utils");

function urlToFilePath(url) {
  const [, locale, , ...slugParts] = url.split("/");
  return path.join(locale.toLowerCase(), slugToFolder(slugParts.join("/")));
}

const find = memoize((relativePath) => {
  return ROOTS.map((root) => path.join(root, relativePath)).find((filePath) =>
    fs.existsSync(filePath)
  );
});

function findByURL(url) {
  return find(urlToFilePath(url));
}

module.exports = {
  findByURL,
};
