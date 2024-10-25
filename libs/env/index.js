import fs from "node:fs";
import path from "node:path";
import { cwd } from "node:process";
import { fileURLToPath } from "node:url";

import * as dotenv from "dotenv";

import { VALID_FLAW_CHECKS } from "../constants/index.js";

const dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = path.join(dirname, "..", "..");

function parse(value) {
  try {
    return JSON.parse(value);
  } catch (e) {
    throw new Error(`Error parsing value '${value}' in .env file: `, {
      cause: e,
    });
  }
}

dotenv.config({
  path: path.join(cwd(), process.env.ENV_FILE || ".env"),
});

// -----
// build
// -----

export const BASE_URL = process.env.BASE_URL || "https://developer.mozilla.org";

export const BUILD_OUT_ROOT =
  process.env.BUILD_OUT_ROOT || path.join(ROOT, "client", "build");

// TODO (far future): Switch to "error" when number of flaws drops.
export const DEFAULT_FLAW_LEVELS = process.env.BUILD_FLAW_LEVELS || "*:warn";

export const FILES = process.env.BUILD_FILES || "";
export const FOLDERSEARCH = process.env.BUILD_FOLDERSEARCH || "";
export const GOOGLE_ANALYTICS_MEASUREMENT_ID =
  process.env.BUILD_GOOGLE_ANALYTICS_MEASUREMENT_ID || "";
export const NO_PROGRESSBAR = Boolean(
  parse(process.env.BUILD_NO_PROGRESSBAR || process.env.CI || "false")
);
export const FIX_FLAWS = parse(process.env.BUILD_FIX_FLAWS || "false");
export const FIX_FLAWS_DRY_RUN = parse(
  process.env.BUILD_FIX_FLAWS_DRY_RUN || "false"
);
export const FIX_FLAWS_TYPES = new Set(
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

export const FIX_FLAWS_VERBOSE = parse(
  // It's on by default because it's such a sensible option to always have
  // on.
  process.env.BUILD_FIX_FLAWS_VERBOSE || "true"
);

// See explanation in docs/envvars.md
export const ALWAYS_ALLOW_ROBOTS = parse(
  process.env.BUILD_ALWAYS_ALLOW_ROBOTS || "false"
);

export const SENTRY_DSN_BUILD = process.env.SENTRY_DSN_BUILD || "";

// -------
// content
// -------

export const CONTENT_ROOT = correctContentPathFromEnv("CONTENT_ROOT");

export const CONTENT_TRANSLATED_ROOT = correctContentPathFromEnv(
  "CONTENT_TRANSLATED_ROOT"
);

export const CONTRIBUTOR_SPOTLIGHT_ROOT = correctContentPathFromEnv(
  "CONTRIBUTOR_SPOTLIGHT_ROOT"
);

export const BLOG_ROOT = correctContentPathFromEnv("BLOG_ROOT");

export const CURRICULUM_ROOT = correctPathFromEnv("CURRICULUM_ROOT");

// Make a combined array of all truthy roots. This way, you don't
// need to constantly worry about CONTENT_TRANSLATED_ROOT potentially being
// null.
export const ROOTS = [CONTENT_ROOT];
if (CONTENT_TRANSLATED_ROOT) {
  ROOTS.push(CONTENT_TRANSLATED_ROOT);
}

function correctPathFromEnv(envVarName) {
  let pathName = process.env[envVarName];
  if (!pathName) {
    return;
  }
  pathName = fs.realpathSync(pathName);
  return pathName;
}

function correctContentPathFromEnv(envVarName) {
  let pathName = correctPathFromEnv(envVarName);
  if (!pathName) {
    return;
  }
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

export const MAX_FILE_SIZE = parse(
  process.env.FILECHECK_MAX_FILE_SIZE || 500 * 1024 // 500KiB
);

// ----------
// kumascript
// ----------

const SERVER_PORT = process.env.SERVER_PORT || 5042;
const SERVER_URL = `http://localhost:${SERVER_PORT}`;

// Allow the `process.env.BUILD_LIVE_SAMPLES_BASE_URL` to be falsy
// if it *is* set.
export const LIVE_SAMPLES_BASE_URL =
  process.env.BUILD_LIVE_SAMPLES_BASE_URL !== undefined
    ? process.env.BUILD_LIVE_SAMPLES_BASE_URL
    : SERVER_URL;

export const LEGACY_LIVE_SAMPLES_BASE_URL =
  process.env.BUILD_LEGACY_LIVE_SAMPLES_BASE_URL !== undefined
    ? process.env.BUILD_LEGACY_LIVE_SAMPLES_BASE_URL
    : LIVE_SAMPLES_BASE_URL || SERVER_URL;

export const INTERACTIVE_EXAMPLES_BASE_URL =
  process.env.BUILD_INTERACTIVE_EXAMPLES_BASE_URL ||
  "https://interactive-examples.mdn.mozilla.net";

// ------
// server
// ------

export const STATIC_ROOT =
  process.env.SERVER_STATIC_ROOT || path.join(ROOT, "client", "build");
export const PROXY_HOSTNAME =
  process.env.REACT_APP_KUMA_HOST || "developer.mozilla.org";
export const CONTENT_HOSTNAME = process.env.SERVER_CONTENT_HOST;

export const FAKE_V1_API = parse(process.env.SERVER_FAKE_V1_API || false);

// ----
// tool
// ----

export const OPENAI_KEY = process.env.OPENAI_KEY || "";
export const PG_URI = process.env.PG_URI || "";

export const SAMPLE_SIGN_KEY = process.env.BUILD_SAMPLE_SIGN_KEY
  ? Buffer.from(process.env.BUILD_SAMPLE_SIGN_KEY, "base64")
  : null;

const CRUD_MODE =
  process.env.REACT_APP_WRITER_MODE || process.env.REACT_APP_DEV_MODE
    ? false
    : Boolean(
        JSON.parse(
          process.env.REACT_APP_CRUD_MODE ||
            JSON.stringify(process.env.NODE_ENV === "development")
        )
      );
export const DEV_MODE =
  CRUD_MODE || Boolean(JSON.parse(process.env.REACT_APP_DEV_MODE || "false"));
