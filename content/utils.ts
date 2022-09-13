import path from "path";
import childProcess from "child_process";

import { CONTENT_ROOT, CONTENT_TRANSLATED_ROOT } from "../libs/env";
import { slugToFolder as _slugToFolder } from "../libs/slug-utils";
import LRU from "lru-cache";

export const MEMOIZE_INVALIDATE = Symbol("force cache update");

export function getRoot(locale, throws = "") {
  const root =
    locale.toLowerCase() === "en-us" ? CONTENT_ROOT : CONTENT_TRANSLATED_ROOT;
  if (throws && !root) {
    throw new Error(throws);
  }
  return root;
}

export function buildURL(locale, slug) {
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
export function memoize(fn: Function): Function {
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

export function execGit(args, opts: { cwd?: string } = {}, root = null) {
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

export function toPrettyJSON(value) {
  const json = JSON.stringify(value, null, 2) + "\n";
  try {
    // eslint-disable-next-line node/no-unpublished-require
    return require("prettier").format(json, { parser: "json" });
  } catch (e) {
    return json;
  }
}

export function urlToFolderPath(url) {
  const [, locale, , ...slugParts] = url.split("/");
  return path.join(locale.toLowerCase(), slugToFolder(slugParts.join("/")));
}

export function slugToFolder(slug) {
  return _slugToFolder(slug, path.sep);
}
