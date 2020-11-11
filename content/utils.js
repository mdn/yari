const path = require("path");
const childProcess = require("child_process");
const sanitizeFilename = require("sanitize-filename");
const { CONTENT_ROOT } = require("./constants");

function buildURL(locale, slug) {
  if (!locale) throw new Error("locale falsy!");
  if (!slug) throw new Error("slug falsy!");
  return `/${locale}/docs/${slug}`;
}

/*
 * NOTE: A nearly identical copy of this function is used within
 *       ./lambda/content-origin-request/index.js. If you make a
 *       change to this function, you must replicate the change
 *       there as well.
 */
function slugToFolder(slug) {
  return (
    slug
      // We have slugs with these special characters that would be
      // removed by the sanitizeFilename() function. What might then
      // happen is that it leads to two *different slugs* becoming
      // *same* folder name.
      .replace(/\*/g, "_star_")
      .replace(/::/g, "_doublecolon_")
      .replace(/:/g, "_colon_")
      .replace(/\?/g, "_question_")

      .toLowerCase()
      .split("/")
      .map(sanitizeFilename)
      .join(path.sep)
  );
}

function isPromise(p) {
  return p && Object.prototype.toString.call(p) === "[object Promise]";
}

/**
 * Memoizes the result of the given function call, mapping parameters to
 * return values. If NODE_ENV is not set to production it simply returns
 * the function itself.
 * Note: The parameter are turned into a cache key quite naively, so
 * different object key order would lead to new cache entries.
 */
function memoize(fn) {
  if (process.env.NODE_ENV !== "production") {
    return fn;
  }

  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const value = fn(...args);
    if (isPromise(value)) {
      return value.then((actualValue) => {
        cache.set(key, actualValue);
        return actualValue;
      });
    }
    cache.set(key, value);
    return value;
  };
}

function execGit(args, opts = {}, root = null) {
  let gitRoot = root;
  if (!gitRoot) {
    gitRoot = execGit(
      ["rev-parse", "--show-toplevel"],
      opts,
      opts.cwd || CONTENT_ROOT
    );
  }
  const { status, error, stdout, stderr } = childProcess.spawnSync(
    "git",
    args,
    {
      cwd: gitRoot,
    }
  );
  if (error || status !== 0) {
    throw new Error(`git command failed:\n${stderr.toString()}`);
  }
  return stdout.toString().trim();
}

module.exports = {
  buildURL,
  slugToFolder,
  memoize,
  execGit,
};
