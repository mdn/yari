const fs = require("fs");
const path = require("path");

const { resolveFundamental } = require("../libs/fundamental-redirects");
const { decodePath, slugToFolder } = require("../libs/slug-utils");
const {
  CONTENT_ROOT,
  CONTENT_TRANSLATED_ROOT,
  VALID_LOCALES,
} = require("./constants");

const FORBIDDEN_URL_SYMBOLS = ["\n", "\t"];

let ARCHIVED_URLS;

function checkURLInvalidSymbols(url) {
  for (const character of FORBIDDEN_URL_SYMBOLS) {
    if (url.includes(character)) {
      throw new Error(`URL contains invalid character '${character}'`);
    }
  }
}

function documentExists(url) {
  // Let's keep vanity urls to /en-US/
  if (url === "/en-US/") {
    return url;
  }
  const [bareURL] = url.split("#", 2);

  if (!ARCHIVED_URLS) {
    ARCHIVED_URLS = new Set(
      fs
        .readFileSync(path.join(__dirname, "archived.txt"), "utf-8")
        .split("\n")
        .map((url) => url.toLowerCase())
    );
  }

  if (ARCHIVED_URLS.has(bareURL.toLowerCase())) {
    return `$ARCHIVED/${bareURL}`;
  }

  const [, locale, , ...slug] = bareURL.toLowerCase().split("/");
  const root = locale === "en-us" ? CONTENT_ROOT : CONTENT_TRANSLATED_ROOT;

  const filePath = path.join(
    root,
    locale,
    slugToFolder(slug.join("/")),
    "index.html"
  );
  if (fs.existsSync(filePath)) {
    return filePath;
  }
  return null;
}

// Throw if this can't be a redirect from-URL.
function validateFromURL(url) {
  checkURLInvalidSymbols(url);
  // This is a circular dependency we should solve that in another way.
  validateURLLocale(url);
  const path = documentExists(url);
  if (path) {
    throw new Error(`From-URL resolves to a file (${path})`);
  }
  const resolved = resolve(url);
  if (resolved !== url) {
    throw new Error(
      `${url} is already matched as a redirect (to: '${resolved}')`
    );
  }
}

// Throw if this can't be a redirect to-URL.
function validateToURL(url) {
  // If it's not external, it has to go to a valid document
  if (url.includes("://")) {
    // If this throws, conveniently the validator will do its job.
    const url = new URL(url);
    if (url.protocol !== "https:") {
      throw new Error("We only redirect to https://");
    }
  } else {
    checkURLInvalidSymbols(url);
    validateURLLocale(url);

    // Can't point to something that redirects to something
    const resolved = resolve(url);
    if (resolved !== url) {
      throw new Error(
        `${url} is already matched as a redirect (to: '${resolved}')`
      );
    }
    const path = documentExists(url);
    if (!path) {
      throw new Error(`To-URL has to resolve to a file (${path})`);
    }
  }
}

function validateURLLocale(url) {
  // Check that it's a valid document URL
  const locale = url.split("/")[1];
  if (!locale || url.split("/")[2] !== "docs") {
    throw new Error("The URL is expected to be /$locale/docs/");
  }
  const validValues = [...VALID_LOCALES.values()];
  if (!validValues.includes(locale)) {
    throw new Error(`'${locale}' not in ${validValues}`);
  }
}

function errorOnDuplicated(pairs) {
  const seen = new Set();
  for (const [from] of pairs) {
    const fromLower = from.toLowerCase();
    if (seen.has(fromLower)) {
      throw new Error(`Duplicated redirect: ${fromLower}`);
    }
    seen.add(fromLower);
  }
}

function removeConflictingOldRedirects(oldPairs, updatePairs) {
  if (oldPairs.length === 0) {
    return oldPairs;
  }
  const newTargets = new Set(updatePairs.map(([, to]) => to.toLowerCase()));

  return oldPairs.filter(([from, to]) => {
    const conflictingTo = newTargets.has(from.toLowerCase());
    if (conflictingTo) {
      console.log(`removing conflicting redirect ${from}\t${to}`);
    }
    return !conflictingTo;
  });
}

function removeOrphanedRedirects(pairs) {
  return pairs.filter(([from, to]) => {
    if (documentExists(from)) {
      console.log(`removing orphaned redirect (from exists): ${from}\t${to}`);
      return false;
    }
    if (to.startsWith("/") && !documentExists(to)) {
      console.log(
        `removing orphaned redirect (to doesn't exists): ${from}\t${to}`
      );
      return false;
    }
    return true;
  });
}

function add(locale, updatePairs, { fix = false } = {}) {
  const root = locale === "en-us" ? CONTENT_ROOT : CONTENT_TRANSLATED_ROOT;
  const redirectsFilePath = path.join(
    root,
    locale.toLowerCase(),
    "_redirects.txt"
  );
  let pairs = [];
  if (fs.existsSync(redirectsFilePath)) {
    const content = fs.readFileSync(redirectsFilePath, "utf-8");
    pairs.push(
      ...content
        .trim()
        .split("\n")
        // Skip the header line.
        .slice(1)
        .map((line) => line.trim().split(/\t+/))
    );
  }

  const decodedUpdatePairs = decodePairs(updatePairs);
  const decodedPairs = decodePairs(pairs);

  errorOnDuplicated(decodedPairs);
  errorOnDuplicated(decodedUpdatePairs);

  const cleanPairs = removeConflictingOldRedirects(
    decodedPairs,
    decodedUpdatePairs
  );
  cleanPairs.push(...decodedUpdatePairs);

  let simplifiedPairs = shortCuts(cleanPairs);
  if (fix) {
    simplifiedPairs = removeOrphanedRedirects(simplifiedPairs);
  }
  save(path.join(root, locale.toLowerCase()), simplifiedPairs);
}

// The module level cache
const redirects = new Map();

function load(files = null, verbose = false) {
  if (!files) {
    const localeFolders = fs
      .readdirSync(CONTENT_ROOT)
      .map((n) => path.join(CONTENT_ROOT, n))
      .filter((filepath) => fs.statSync(filepath).isDirectory());
    if (CONTENT_TRANSLATED_ROOT) {
      const translatedLocaleFolders = fs
        .readdirSync(CONTENT_TRANSLATED_ROOT)
        .map((n) => path.join(CONTENT_TRANSLATED_ROOT, n))
        .filter((filepath) => fs.statSync(filepath).isDirectory());
      localeFolders.push(...translatedLocaleFolders);
    }

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
      const split = line.trim().split(/\t/);
      if (split.length !== 2) {
        throwError("Not two strings split by tab", i + 1, line);
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
  return redirects.get(url.toLowerCase()) || resolveFundamental(url).url || url;
};

function shortCuts(pairs, throws = false) {
  // We have mixed cases in the _redirects.txt like:
  // /en-US/docs/window.document     /en-US/docs/Web/API/window.document
  // /en-US/docs/Web/API/Window.document     /en-US/docs/Web/API/Window/document
  // therefore we have to lowercase everything and restore it later.
  const casing = new Map([
    ...pairs.map(([from]) => [from.toLowerCase(), from]),
    ...pairs.map(([, to]) => [to.toLowerCase(), to]),
  ]);
  const dag = new Map(
    pairs.map(([from, to]) => [from.toLowerCase(), to.toLowerCase()])
  );

  // Expand all "edges" and keep track of the nodes we traverse.
  const transit = (s, froms = []) => {
    const next = dag.get(s.toLowerCase());
    if (next) {
      if (froms.includes(next)) {
        const msg = `redirect cycle [${froms.join(", ")}] → ${next}`;
        if (throws) {
          throw new Error(msg);
        }
        console.log(msg);
        return [];
      }
      return transit(next, [...froms, s.toLowerCase()]);
    } else {
      return [froms, s];
    }
  };

  const sortTuples = ([a, b], [c, d]) => {
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
  };

  for (const [from] of pairs) {
    const [froms = [], to] = transit(from);
    for (const from of froms) {
      dag.set(from, to);
    }
  }
  const transitivePairs = [...dag.entries()];
  transitivePairs.sort(sortTuples);

  // Restore cases!
  return transitivePairs.map(([from, to]) => [
    casing.get(from),
    casing.get(to),
  ]);
}

function decodePairs(pairs) {
  return pairs.map(([from, to]) => {
    const fromDecoded = decodePath(from);
    let toDecoded;
    if (to.startsWith("/")) {
      toDecoded = decodePath(to);
    } else {
      toDecoded = decodeURI(to);
    }
    if (
      checkURLInvalidSymbols(from) ||
      (to.startsWith("/") && checkURLInvalidSymbols(to))
    ) {
      throw new Error(`${from}\t${to} contains invalid symbols`);
    }
    return [fromDecoded, toDecoded];
  });
}

function save(localeFolder, pairs) {
  const filePath = path.join(localeFolder, "_redirects.txt");
  const writeStream = fs.createWriteStream(filePath);
  writeStream.write(`# FROM-URL\tTO-URL\n`);
  for (const [fromURL, toURL] of pairs) {
    writeStream.write(`${fromURL}\t${toURL}\n`);
  }
  writeStream.end();
}

module.exports = {
  add,
  resolve,
  load,
  validateFromURL,
  validateToURL,
};
