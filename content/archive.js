const fs = require("fs");
const path = require("path");

const { urlToFolderPath } = require("./utils");

// Module-level cache
let ARCHIVED_PATHS;

function getArchivedPaths() {
  if (!ARCHIVED_PATHS) {
    ARCHIVED_PATHS = new Set(
      fs
        .readFileSync(path.join(__dirname, "archived.txt"), "utf-8")
        .split("\n")
        .filter((line) => !line.startsWith("#") || line.trim())
        .map((url) => url.toLowerCase())
    );
  }
  return ARCHIVED_PATHS;
}

function isArchivedURL(url) {
  const [bareURL] = url.split("#");
  const asFilepath = `${urlToFolderPath(bareURL)}/index.html`;
  return getArchivedPaths().has(asFilepath);
}

function isArchivedFilePath(filePath) {
  return getArchivedPaths().has(filePath);
}

module.exports = {
  isArchivedURL,
  isArchivedFilePath,
};
