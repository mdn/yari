import fs from "fs";
import path from "path";
import { ACTIVE_LOCALES, VALID_LOCALES, 
  DEFAULT_LOCALE, } from "../libs/constants/index.js";

import dotenv from "dotenv";
import { fileURLToPath } from "url";
const dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({
  path: path.join(dirname, "..", process.env.ENV_FILE || ".env"),
});

const CONTENT_ROOT = correctContentPathFromEnv("CONTENT_ROOT");
if (!CONTENT_ROOT) {
  throw new Error("Env var CONTENT_ROOT must be set");
}

const CONTENT_TRANSLATED_ROOT = correctContentPathFromEnv(
  "CONTENT_TRANSLATED_ROOT"
);

const CONTRIBUTOR_SPOTLIGHT_ROOT = correctContentPathFromEnv(
  "CONTRIBUTOR_SPOTLIGHT_ROOT"
);

// This makes it possible to know, give a root folder, what is the name of
// the repository on GitHub.
// E.g. `'https://github.com/' + REPOSITORY_URLS[document.fileInfo.root]`
const REPOSITORY_URLS = {
  [CONTENT_ROOT]: "mdn/content",
};

// Make a combined array of all truthy roots. This way, you don't
// need to constantly worry about CONTENT_TRANSLATED_ROOT potentially being
// null.
const ROOTS = [CONTENT_ROOT];
if (CONTENT_TRANSLATED_ROOT) {
  ROOTS.push(CONTENT_TRANSLATED_ROOT);
  REPOSITORY_URLS[CONTENT_TRANSLATED_ROOT] = "mdn/translated-content";
}

const HTML_FILENAME = "index.html";
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

export {
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
