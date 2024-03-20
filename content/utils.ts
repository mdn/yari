import path from "node:path";
import childProcess from "node:child_process";

import { LRUCache } from "lru-cache";

import { CONTENT_ROOT, CONTENT_TRANSLATED_ROOT } from "../libs/env/index.js";
import { slugToFolder as _slugToFolder } from "../libs/slug-utils/index.js";

let prettier = null;

try {
  prettier = (await import("prettier")).default;
} catch (e) {
  // If we failed to import Prettier, that's okay
}

export const MEMOIZE_INVALIDATE = Symbol("force cache update");

export function getRoot(locale: string, throws = "") {
  const root =
    locale.toLowerCase() === "en-us" ? CONTENT_ROOT : CONTENT_TRANSLATED_ROOT;
  if (throws && !root) {
    throw new Error(throws);
  }
  return root;
}

export function buildURL(locale: string, slug: string) {
  if (!locale) throw new Error("locale falsy!");
  if (!slug) throw new Error("slug falsy!");
  return `/${locale}/docs/${slug}`;
}

/**
 * Memoizes the result of the given function call, mapping parameters to
 * return values. If NODE_ENV is not set to production it simply returns
 * the function itself.
 * Note: The parameter are turned into a cache key quite naively, so
 * different object key order would lead to new cache entries.
 */
export function memoize<F extends (...args: any[]) => any>(
  fn: F
): (...args: [...Parameters<F>, typeof MEMOIZE_INVALIDATE?]) => ReturnType<F> {
  if (process.env.NODE_ENV !== "production") {
    return fn;
  }

  const cache = new LRUCache({ max: 2000 });
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
    cache.set(key, value);
    if (value instanceof Promise) {
      value.catch(() => {
        cache.delete(key);
      });
    }
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

export async function toPrettyJSON(value: unknown) {
  const json = JSON.stringify(value, null, 2) + "\n";
  if (prettier) {
    try {
      return await prettier.format(json, { parser: "json" });
    } catch (e) {
      // If Prettier formatting failed, don't worry
    }
  }
  return json;
}

export function urlToFolderPath(url: string) {
  const [, locale, , ...slugParts] = url.split("/");
  return path.join(locale.toLowerCase(), _slugToFolder(slugParts.join("/")));
}

export function slugToFolder(slug) {
  return _slugToFolder(slug, path.sep);
}
