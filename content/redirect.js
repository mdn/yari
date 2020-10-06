const fs = require("fs");
const path = require("path");
const { textChangeRangeIsUnchanged } = require("typescript");

const { CONTENT_ROOT, VALID_LOCALES } = require("./constants");
const { resolveFundamental } = require("./fundamental-redirects");
const { buildURL } = require("./utils");

// The module level cache
const redirects = new Map();

function load(files = null, verbose = false) {
  if (!files) {
    const localeFolders = fs
      .readdirSync(CONTENT_ROOT)
      .map((n) => path.join(CONTENT_ROOT, n))
      .filter((filepath) => fs.statSync(filepath).isDirectory());

    files = localeFolders
      .map((folder) => path.join(folder, "_redirects.txt"))
      .filter((filePath) => fs.existsSync(filePath));
  }

  function throwError(message, lineNumber, line) {
    throw new Error(`Invalid line: ${message} (line ${lineNumber}) '${line}'`);
  }

  const validLocales = new Set([...VALID_LOCALES.values()]);

  for (const redirectsFilePath of files) {
    if (verbose) {
      console.log(`Checking ${redirectsFilePath}`);
    }
    const content = fs.readFileSync(redirectsFilePath, "utf-8");
    if (!content.endsWith("\n")) {
      throw new Error(
        `${redirectsFilePath} must have a trailing newline character.`
      );
    }
    const pairs = new Map();
    // Parse and collect all and throw errors on bad lines
    content.split("\n").forEach((line, i) => {
      if (!line.trim() || line.startsWith("#")) return;
      const split = line.trim().split(/\s+/);
      if (split.length !== 2) {
        throwError("Not two strings split by whitespace", i + 1, line);
      }
      const [from, to] = split;
      if (!from.startsWith("/")) {
        throwError("From-URL must start with a /", i + 1, line);
      }
      if (!from.includes("/docs/")) {
        throwError("From-URL must contain '/docs/'", i + 1, line);
      }
      if (!validLocales.has(from.split("/")[1])) {
        throwError(
          `The locale prefix is not valid or wrong case '${
            from.split("/")[1]
          }'.`,
          i + 1,
          line
        );
      }
      pairs.set(from.toLowerCase(), to);
    });
    // Now that all have been collected, transfer them to the `redirects` map
    // but also do invariance checking.
    for (const [from, to] of pairs) {
      redirects.set(from.toLowerCase(), to);
    }
  }
}

const resolve = (url) => {
  if (!redirects.size) {
    load();
  }
  return redirects.get(url.toLowerCase()) || resolveFundamental(url) || url;
};

function sortTuples([a, b], [c, d]) {
  if (a > c) {
    return 1;
  }
  if (a < c) {
    return -1;
  }
  if (b > d) {
    return 1;
  }
  if (b < d) {
    return -1;
  }
  return 0;
}

function shortCuts(pairs, throws = false) {
  const dag = new Map(pairs);

  // Expand all "edges" and keep track of the nodes we traverse.
  const transit = (s, froms = []) => {
    let next = dag.get(s);
    if (next) {
      if (froms.includes(next)) {
        const msg = `redirect cycle [${froms.join(", ")}] → ${next}`;
        if (throws) {
          throw new Error(msg);
        }
        console.warn(msg);
        return [];
      }
      return transit(next, [...froms, s]);
    } else {
      return [froms, s];
    }
  };
  for (const [from, _] of pairs) {
    const [froms = [], to] = transit(from);
    for (const from of froms) {
      dag.set(from, to);
    }
  }
  const transitivePairs = [...dag.entries()];
  transitivePairs.sort(sortTuples);
  return transitivePairs;
}

function write(localeFolder, pairs) {
  const transitivePairs = shortCuts(paris);
  const filePath = path.join(localeFolder, "_redirects.txt");
  const writeStream = fs.createWriteStream(filePath);
  writeStream.write(`# FROM-URL\tTO-URL\n`);
  for (const [fromURL, toURL] of transitivePairs) {
    writeStream.write(`${fromURL}\t${toURL}\n`);
  }
  writeStream.end();
}

module.exports = {
  resolve,
  write,
  load,
};
