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

const resolve = (url) => {
  if (!redirects.size) {
    const localeFolders = fs
      .readdirSync(CONTENT_ROOT)
      .map((n) => path.join(CONTENT_ROOT, n))
      .filter((filepath) => fs.statSync(filepath).isDirectory());

    for (const folder of localeFolders) {
      const redirectsFilePath = path.join(folder, "_redirects.txt");
      if (!fs.existsSync(redirectsFilePath)) {
        continue;
      }

      const redirectPairs = fs
        .readFileSync(redirectsFilePath, "utf-8")
        .split("\n")
        .slice(1, -1)
        .map((line) => line.trim().split(/\s+/));
      for (const [from, to] of redirectPairs) {
        redirects.set(from.toLowerCase(), to);
      }
    }
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
};
