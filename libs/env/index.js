const fs = require("fs");
const path = require("path");

const dotenv = require("dotenv");
const dirname = __dirname;

const { VALID_FLAW_CHECKS } = require("@yari-internal/constants");

const ROOT = path.join(dirname, "..", "..");

dotenv.config({
  path: path.join(ROOT, process.env.ENV_FILE || ".env"),
});

// -----
// build
// -----

const BUILD_OUT_ROOT =
  process.env.BUILD_OUT_ROOT || path.join(ROOT, "client", "build");

// TODO (far future): Switch to "error" when number of flaws drops.
const DEFAULT_FLAW_LEVELS = process.env.BUILD_FLAW_LEVELS || "*:warn";

const FILES = process.env.BUILD_FILES || "";
const FOLDERSEARCH = process.env.BUILD_FOLDERSEARCH || "";
const GOOGLE_ANALYTICS_ACCOUNT =
  process.env.BUILD_GOOGLE_ANALYTICS_ACCOUNT || "";
const GOOGLE_ANALYTICS_DEBUG = JSON.parse(
  process.env.BUILD_GOOGLE_ANALYTICS_DEBUG || "false"
);
const NO_PROGRESSBAR = Boolean(
  JSON.parse(process.env.BUILD_NO_PROGRESSBAR || process.env.CI || "false")
);
const FIX_FLAWS = JSON.parse(process.env.BUILD_FIX_FLAWS || "false");
const FIX_FLAWS_DRY_RUN = JSON.parse(
  process.env.BUILD_FIX_FLAWS_DRY_RUN || "false"
);
const FIX_FLAWS_TYPES = new Set(
  (process.env.BUILD_FIX_FLAWS_TYPES &&
    process.env.BUILD_FIX_FLAWS_TYPES.split(",")) || [...VALID_FLAW_CHECKS]
);

if ([...FIX_FLAWS_TYPES].some((flawType) => !VALID_FLAW_CHECKS.has(flawType))) {
  throw new Error(
    `Env var BUILD_FIX_FLAWS_TYPES must be a subset of ${[
      ...VALID_FLAW_CHECKS.values(),
    ].join(",")}`
  );
}

const FIX_FLAWS_VERBOSE = JSON.parse(
  // It's on by default because it's such a sensible option to always have
  // on.
  process.env.BUILD_FIX_FLAWS_VERBOSE || "true"
);

// See explanation in docs/envvars.md
const ALWAYS_ALLOW_ROBOTS = JSON.parse(
  process.env.BUILD_ALWAYS_ALLOW_ROBOTS || "false"
);

// -------
// content
// -------

const CONTENT_ROOT = correctContentPathFromEnv("CONTENT_ROOT");

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

// ---------
// filecheck
// ---------

const MAX_FILE_SIZE = JSON.parse(
  process.env.FILECHECK_MAX_FILE_SIZE || 1024 * 1024 * 100 // ~100MiB
);

// ----------
// kumascript
// ----------

const SERVER_PORT = process.env.SERVER_PORT || 5042;
const SERVER_URL = `http://localhost:${SERVER_PORT}`;

// Allow the `process.env.BUILD_LIVE_SAMPLES_BASE_URL` to be falsy
// if it *is* set.
const LIVE_SAMPLES_BASE_URL =
  process.env.BUILD_LIVE_SAMPLES_BASE_URL !== undefined
    ? process.env.BUILD_LIVE_SAMPLES_BASE_URL
    : SERVER_URL;

const INTERACTIVE_EXAMPLES_BASE_URL =
  process.env.BUILD_INTERACTIVE_EXAMPLES_BASE_URL ||
  "https://interactive-examples.mdn.mozilla.net";

// ------
// server
// ------

const STATIC_ROOT =
  process.env.SERVER_STATIC_ROOT || path.join(ROOT, "client", "build");
const PROXY_HOSTNAME =
  process.env.REACT_APP_KUMA_HOST || "developer.mozilla.org";
const CONTENT_HOSTNAME = process.env.SERVER_CONTENT_HOST;
const OFFLINE_CONTENT = process.env.SERVER_OFFLINE_CONTENT === "true";

const FAKE_V1_API = JSON.parse(process.env.SERVER_FAKE_V1_API || false);

module.exports = {
  ROOT,
  // build
  BUILD_OUT_ROOT,
  DEFAULT_FLAW_LEVELS,
  FILES,
  FOLDERSEARCH,
  GOOGLE_ANALYTICS_ACCOUNT,
  GOOGLE_ANALYTICS_DEBUG,
  NO_PROGRESSBAR,
  FIX_FLAWS,
  FIX_FLAWS_DRY_RUN,
  FIX_FLAWS_TYPES,
  FIX_FLAWS_VERBOSE,
  ALWAYS_ALLOW_ROBOTS,
  // content
  CONTENT_ROOT,
  CONTENT_TRANSLATED_ROOT,
  CONTRIBUTOR_SPOTLIGHT_ROOT,
  REPOSITORY_URLS,
  ROOTS,
  // filecheck
  MAX_FILE_SIZE,
  // kumascript,
  LIVE_SAMPLES_BASE_URL,
  INTERACTIVE_EXAMPLES_BASE_URL,
  // server
  STATIC_ROOT,
  PROXY_HOSTNAME,
  CONTENT_HOSTNAME,
  OFFLINE_CONTENT,
  FAKE_V1_API,
};
