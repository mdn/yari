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

      const content = fs.readFileSync(redirectsFilePath, "utf-8");

      const redirectPairs = content
        .split("\n")
        .slice(1, -1)
        .map((line) => line.trim().split(/\s+/));

      const normalizedPairs = new Map();
      for (const [from, to] of redirectPairs) {
        normalizedPairs.set(from.toLowerCase(), to.toLowerCase());
      }

      for (const [from, to] of redirectPairs) {
        let toNormalized = to.toLowerCase();
        if (normalizedPairs.has(toNormalized)) {
          // It loops back on itself!
          // console.log("ROGUE", [from, to]);
          const chain = [toNormalized];
          let skip = false;
          while (toNormalized && normalizedPairs.has(toNormalized)) {
            toNormalized = normalizedPairs.get(toNormalized);
            chain.push(toNormalized);
            if (chain.length > 2) {
              // console.log("REALLY ROGUE", [from, to], chain);
              skip = true;
              break;
            }
          }
        } else {
          redirects.set(from.toLowerCase(), to);
        }
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
