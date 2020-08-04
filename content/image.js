const fs = require("fs");
const path = require("path");

const { ROOTS } = require("./constants");
const { memoize, slugToFolder } = require("./utils");

function urlToFilePath(url) {
  const [, locale, , ...slugParts] = url.split("/");
  return path.join(locale.toLowerCase(), slugToFolder(slugParts.join("/")));
}

const find = memoize((relpath) => {
  const filePath = ROOTS.map((root) =>
    path.join(root, relpath)
  ).find((filePath) => fs.existsSync(filePath));
  if (!filePath) {
    return;
  }
  return filePath;
});

function findByURL(url) {
  return find(urlToFilePath(url));
}

module.exports = {
  findByURL,
};
