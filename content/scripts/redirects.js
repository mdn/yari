const fs = require("fs");
const path = require("path");

const { CONTENT_ROOT } = require("./constants");
const { buildURL } = require("./utils");

function addRedirect(locale, oldSlug, newSlug) {
  const oldURL = buildURL(locale, oldSlug);
  const newURL = buildURL(locale, newSlug);
  const pairs = Array.from(this.allRedirects.entries()).map(([from, to]) => [
    from,
    to.startsWith(oldURL) ? to.replace(oldURL, newURL) : to,
  ]);
  pairs.push([oldURL, newURL]);
  writeRedirects(path.join(contentRoot, locale), pairs);
}

function resolveRedirect(url) {
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
      .map((line) => line.split("\t"));
    for (const [from, to] of redirectPairs) {
      if (from.toLowerCase() === url.toLowerCase()) {
        return to;
      }
    }
  }
  return url;
}

function writeRedirects(localeFolder, pairs) {
  const filePath = path.join(localeFolder, "_redirects.txt");
  const writeStream = fs.createWriteStream(filePath);
  writeStream.write(`# FROM-URL\tTO-URL\n`);
  for (const [fromURL, toURL] of pairs) {
    writeStream.write(`${fromURL}\t${toURL}\n`);
  }
  writeStream.end();
}

module.exports = { addRedirect, resolveRedirect, writeRedirects };
