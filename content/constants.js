const path = require("path");
const fs = require("fs");
const { VALID_LOCALES } = require("../libs/constants");

require("dotenv").config({
  path: path.join(__dirname, "..", process.env.ENV_FILE || ".env"),
});

const attemptedContentRoot = process.env.CONTENT_ROOT;
let CONTENT_ROOT;
if (!attemptedContentRoot) {
  throw "Env var CONTENT_ROOT must be set";
}
if (!fs.existsSync(attemptedContentRoot)) {
  throw new Error(`${path.resolve(attemptedContentRoot)} does not exist!`);
}
if (fs.existsSync(`${attemptedContentRoot}/files`)) {
  CONTENT_ROOT = `${attemptedContentRoot}/files`;
  console.warn("Add '/files' to your content root");
} else {
  CONTENT_ROOT = attemptedContentRoot;
}

const CONTENT_ARCHIVED_ROOT = process.env.CONTENT_ARCHIVED_ROOT;
const CONTENT_TRANSLATED_ROOT = process.env.CONTENT_TRANSLATED_ROOT;

// This makes it possible to know, give a root folder, what is the name of
// the repository on GitHub.
// E.g. `'https://github.com/' + REPOSITORY_URLS[document.fileInfo.root]`
const REPOSITORY_URLS = {
  [CONTENT_ROOT]: "mdn/content",
};

// Make a combined array of all truthy roots. This way, you don't
// need to constantly worry about CONTENT_ARCHIVED_ROOT potentially being
// null.
const ROOTS = [CONTENT_ROOT];
if (CONTENT_ARCHIVED_ROOT) {
  ROOTS.push(CONTENT_ARCHIVED_ROOT);
  REPOSITORY_URLS[CONTENT_ARCHIVED_ROOT] = "mdn/archived-content";
}
if (CONTENT_TRANSLATED_ROOT) {
  ROOTS.push(CONTENT_TRANSLATED_ROOT);
  REPOSITORY_URLS[CONTENT_TRANSLATED_ROOT] = "mdn/translated-content";
}

module.exports = {
  CONTENT_ROOT,
  CONTENT_ARCHIVED_ROOT,
  CONTENT_TRANSLATED_ROOT,
  REPOSITORY_URLS,
  ROOTS,
  VALID_LOCALES,
};
