const fs = require("fs");
const path = require("path");

const { CONTENT_ROOT } = require("./constants");
const { buildURL } = require("./utils");

function add(locale, oldSlug, newSlug) {
  const oldURL = buildURL(locale, oldSlug);
  const newURL = buildURL(locale, newSlug);
  const pairs = Array.from(this.allRedirects.entries()).map(([from, to]) => [
    from,
    to.startsWith(oldURL) ? to.replace(oldURL, newURL) : to,
  ]);
  pairs.push([oldURL, newURL]);
  const filePath = path.join(path.join(contentRoot, locale), "_redirects.txt");
  const writeStream = fs.createWriteStream(filePath);
  writeStream.write(`# FROM-URL\tTO-URL\n`);
  for (const [fromURL, toURL] of pairs) {
    writeStream.write(`${fromURL}\t${toURL}\n`);
  }
  writeStream.end();
}

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

  for (const redirectsFilePath of files) {
    if (verbose) {
      console.log(`Checking ${redirectsFilePath}`);
    }
    const content = fs.readFileSync(redirectsFilePath, "utf-8");
    // const normalizedPairs = new Map();
    const pairs = new Map();
    // Parse and collect all and throw errors on bad lines
    content.split("\n").forEach((line, i) => {
      if (!line.trim() || line.startsWith("#")) return;
      const split = line.trim().split(/\s+/);
      if (split.length !== 2) {
        console.log(split);
        throw new Error(
          `Invalid line: Not two strings split by whitespace. (${
            i + 1
          }) ${line}`
        );
      }
      const [from, to] = split;
      // normalizedPairs.set(from.toLowerCase(), to.toLowerCase());
      pairs.set(from.toLowerCase(), to);
    });
    // Now that all have been collected, transfer them to the `redirects` map
    // but also do invariance checking.
    for (const [from, to] of pairs) {
      console.log("CHECK", [from, to]);
      redirects.set(from.toLowerCase(), to);
    }

    const redirectPairs = content
      .split("\n")
      .slice(1, -1)
      .map((line) => line.trim().split(/\s+/));
    for (const [from, to] of redirectPairs) {
      redirects.set(from.toLowerCase(), to);
    }
  }
}

const resolve = (url) => {
  if (!redirects.size) {
    load();
  }
  return redirects.get(url.toLowerCase()) || url;
};

function write(localeFolder, pairs) {
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
  write,
  load,
};
