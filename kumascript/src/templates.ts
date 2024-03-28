/**
 * The Templates class is a thin wrapper around the EJS templating system.
 *
 * Given a directory in the local filesystem, it finds all .ejs (and
 * also .js and .json) files under that directory and assumes that
 * they are all valid EJS templates. It uses the lowercase filename,
 * with path and extension removed as a unique identifier for the
 * macro. (The constructor raises an error if macro names are not
 * unique within the directory.)
 *
 * The render() method takes the name of a template and an execution
 * context object and renders the named template in that context. (See
 * the getExecutionContext() method of the Environment object to obtain
 * an execution context.) render() is declared async, so it returns
 * Promise<string> rather than returning a string directly, which
 * supports templates that are themselves async.
 *
 * render() relies on EJS's built-in caching and file-loading
 * capabilities so no template should ever need to be loaded or
 * compiled more than once.
 *
 * The getTemplateMap() function returns a Map object that maps
 * template names to the name of the file that implements the
 * template (this is used by the /macros/ endpoint in server.js)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ejs from "ejs";
import { LRUCache } from "lru-cache";

const DEFAULT_MACROS_DIRECTORY = path.normalize(
  fileURLToPath(new URL("../macros", import.meta.url))
);

const RENDER_CACHE = new LRUCache<string, string>({ max: 100 });

export let isRenderCacheEnabled = false;

export function toggleRenderCache(value: boolean) {
  isRenderCacheEnabled = value;
}

export default class Templates {
  private macroDirectory: string;
  private macroNameToPath: Map<string, string>;

  constructor(macroDirectory = DEFAULT_MACROS_DIRECTORY) {
    this.macroDirectory = macroDirectory;
    this.macroNameToPath = new Map();

    // Find all the macros in the macros dir and build a map
    // from macro name to filename
    const dirs = [macroDirectory];
    const duplicates = new Map();

    // Walk the directory tree under the specified root directory.
    while (dirs.length > 0) {
      const dir = dirs.shift();
      fs.readdirSync(dir).forEach((fn) => {
        // If the given filename is a directory, push it onto
        // the queue, otherwise consider it a template.
        const fp = path.join(dir, fn);
        if (fs.statSync(fp).isDirectory()) {
          dirs.push(fp);
        } else if (
          fp.endsWith(".js") ||
          fp.endsWith(".ejs") ||
          fp.endsWith(".json")
        ) {
          const name = path.parse(fn).name.toLowerCase();
          if (this.macroNameToPath.has(name)) {
            // Keep track of all duplicates and throw error later.
            if (!duplicates.has(name)) {
              duplicates.set(name, [this.macroNameToPath.get(name), fp]);
            } else {
              duplicates.get(name).push(fp);
            }
          } else {
            this.macroNameToPath.set(name, fp);
          }
        }
      });
    }

    if (this.macroNameToPath.size === 0) {
      // Let's throw an error if no macros could be discovered, since
      // for now this is the only time we check and this loader is
      // useless if there are no macros.
      throw new Error(`No macros found in "${macroDirectory}"`);
    }

    if (duplicates.size !== 0) {
      // Duplicate template names
      let msg = "Duplicate macros:";
      for (const [name, files] of duplicates) {
        msg += `\n${name}: ${files.join(", ")}`;
      }
      throw new Error(msg);
    }
  }

  async render(name, args?: any) {
    // Normalize the macro name by converting colons to hyphens and
    // uppercase letters to lowercase.
    name = name.replace(/:/g, "-").toLowerCase();
    const path = this.macroNameToPath.get(name);
    if (!path) {
      // There is code in render.js that catches this error and
      // creates a more informative MacroNotFoundError
      throw new ReferenceError(`Unknown macro ${name}`);
    }
    try {
      const cacheKey = `${args?.env?.locale}:${name}:${JSON.stringify(args.$$)}`;

      let output = RENDER_CACHE.get(cacheKey);

      if (!output) {
        output = await ejs.renderFile(path, args, {
          async: true,
          cache: args.cache || process.env.NODE_ENV === "production",
        });
        output = output.trim();
      }

      if (isRenderCacheEnabled) {
        RENDER_CACHE.set(cacheKey, output);
        toggleRenderCache(false);
      }

      return output;
    } catch (error) {
      console.error(
        `The ${name} macro on ${args?.env?.url} failed to render.`,
        error
      );
      throw error;
    }
  }

  getTemplateMap() {
    return new Map(this.macroNameToPath);
  }
}
