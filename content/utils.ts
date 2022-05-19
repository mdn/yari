// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'path'.
const path = require("path");
const childProcess = require("child_process");

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'CONTENT_RO... Remove this comment to see the full error message
const { CONTENT_ROOT, CONTENT_TRANSLATED_ROOT } = require("./constants");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'slugToFold... Remove this comment to see the full error message
const { slugToFolder } = require("../libs/slug-utils");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'LRU'.
const LRU = require("lru-cache");

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'MEMOIZE_IN... Remove this comment to see the full error message
const MEMOIZE_INVALIDATE = Symbol("force cache update");

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'getRoot'.
function getRoot(locale, throws = "") {
  const root =
    locale.toLowerCase() === "en-us" ? CONTENT_ROOT : CONTENT_TRANSLATED_ROOT;
  if (throws && !root) {
    throw new Error(throws);
  }
  return root;
}

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'buildURL'.
function buildURL(locale, slug) {
  if (!locale) throw new Error("locale falsy!");
  if (!slug) throw new Error("slug falsy!");
  return `/${locale}/docs/${slug}`;
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
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'memoize'.
function memoize(fn) {
  if (process.env.NODE_ENV !== "production") {
    return fn;
  }

  const cache = new LRU({ max: 2000 });
  return (...args) => {
    let invalidate = false;
    if (args.includes(MEMOIZE_INVALIDATE)) {
      args.splice(args.indexOf(MEMOIZE_INVALIDATE), 1);
      invalidate = true;
    }
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      if (invalidate) {
        cache.delete(key);
      } else {
        return cache.get(key);
      }
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

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'execGit'.
function execGit(args, opts = {}, root = null) {
  let gitRoot = root;
  if (!gitRoot) {
    gitRoot = execGit(
      ["rev-parse", "--show-toplevel"],
      opts,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'cwd' does not exist on type '{}'.
      opts.cwd || CONTENT_ROOT
    );
  }
  const { status, error, stdout, stderr } = childProcess.spawnSync(
    "git",
    args,
    {
      cwd: gitRoot,
      // Default is 1MB
      // That's rarely big enough for what we're using Yari for.
      maxBuffer: 1024 * 1024 * 100, // 100MB
    }
  );
  if (error || status !== 0) {
    if (stderr) {
      console.log(args);
      console.log(`Error running git ${args}`);
      console.error(stderr);
    }
    if (error) {
      throw error;
    }
    throw new Error(
      `git command failed: ${stderr.toString() || stdout.toString()}`
    );
  }
  return stdout.toString().trim();
}

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'urlToFolde... Remove this comment to see the full error message
function urlToFolderPath(url) {
  const [, locale, , ...slugParts] = url.split("/");
  return path.join(locale.toLowerCase(), slugToFolder(slugParts.join("/")));
}

module.exports = {
  buildURL,
  getRoot,
  slugToFolder: (slug) => slugToFolder(slug, path.sep),
  memoize,
  execGit,
  urlToFolderPath,
  MEMOIZE_INVALIDATE,
};
