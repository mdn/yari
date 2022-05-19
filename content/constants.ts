// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'fs'.
const fs = require("fs");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'path'.
const path = require("path");
const {
  // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'ACTIVE_LOC... Remove this comment to see the full error message
  ACTIVE_LOCALES,
  // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'VALID_LOCA... Remove this comment to see the full error message
  VALID_LOCALES,
  // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'DEFAULT_LO... Remove this comment to see the full error message
  DEFAULT_LOCALE,
} = require("../libs/constants");

const dotenv = require("dotenv");
const dirname = __dirname;
dotenv.config({
  path: path.join(dirname, "..", process.env.ENV_FILE || ".env"),
});

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'CONTENT_RO... Remove this comment to see the full error message
const CONTENT_ROOT = correctContentPathFromEnv("CONTENT_ROOT");
if (!CONTENT_ROOT) {
  throw new Error("Env var CONTENT_ROOT must be set");
}

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'CONTENT_TR... Remove this comment to see the full error message
const CONTENT_TRANSLATED_ROOT = correctContentPathFromEnv(
  "CONTENT_TRANSLATED_ROOT"
);

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'CONTRIBUTO... Remove this comment to see the full error message
const CONTRIBUTOR_SPOTLIGHT_ROOT = correctContentPathFromEnv(
  "CONTRIBUTOR_SPOTLIGHT_ROOT"
);

// This makes it possible to know, give a root folder, what is the name of
// the repository on GitHub.
// E.g. `'https://github.com/' + REPOSITORY_URLS[document.fileInfo.root]`
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'REPOSITORY... Remove this comment to see the full error message
const REPOSITORY_URLS = {
  [CONTENT_ROOT]: "mdn/content",
};

// Make a combined array of all truthy roots. This way, you don't
// need to constantly worry about CONTENT_TRANSLATED_ROOT potentially being
// null.
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'ROOTS'.
const ROOTS = [CONTENT_ROOT];
if (CONTENT_TRANSLATED_ROOT) {
  ROOTS.push(CONTENT_TRANSLATED_ROOT);
  REPOSITORY_URLS[CONTENT_TRANSLATED_ROOT] = "mdn/translated-content";
}

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'HTML_FILEN... Remove this comment to see the full error message
const HTML_FILENAME = "index.html";
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'MARKDOWN_F... Remove this comment to see the full error message
const MARKDOWN_FILENAME = "index.md";

function correctContentPathFromEnv(envVarName) {
  let pathName = process.env[envVarName];
  if (!pathName) {
    return;
  }
  pathName = fs.realpathSync(pathName);
  if (
    path.basename(pathName) !== "files" &&
    fs.existsSync(path.join(pathName, "files"))
  ) {
    // It can be "corrected"
    pathName = path.join(pathName, "files");
    console.warn(
      `Corrected the ${envVarName} environment variable to ${pathName}`
    );
  } else if (!fs.existsSync(pathName)) {
    throw new Error(`${path.resolve(pathName)} does not exist`);
  }
  return pathName;
}

module.exports = {
  CONTENT_ROOT,
  CONTENT_TRANSLATED_ROOT,
  CONTRIBUTOR_SPOTLIGHT_ROOT,
  REPOSITORY_URLS,
  ROOTS,
  VALID_LOCALES,
  ACTIVE_LOCALES,
  DEFAULT_LOCALE,
  HTML_FILENAME,
  MARKDOWN_FILENAME,
};
