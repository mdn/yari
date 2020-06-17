function addRedirect(locale, oldSlug, newSlug) {
  const oldURL = buildMDNUrl(locale, oldSlug);
  const newURL = buildMDNUrl(locale, newSlug);
  const pairs = Array.from(this.allRedirects.entries()).map(([from, to]) => [
    from,
    to.startsWith(oldURL) ? to.replace(oldURL, newURL) : to,
  ]);
  pairs.push([oldURL, newURL]);
  writeRedirects(path.join(contentRoot, locale), pairs);
}

function resolveRedirect(url) {
  return url;

  //TODO
  const contentRoot = process.env.BUILD_ROOT;
  // They're all in 1 level deep from the content root
  fs.readdirSync(contentRoot)
    .map((n) => path.join(contentRoot, n))
    .filter((filepath) => fs.statSync(filepath).isDirectory())
    .forEach((directory) => {
      fs.readdirSync(directory)
        .filter((n) => n === "_redirects.txt")
        .map((n) => path.join(directory, n))
        .forEach((filepath) => {
          const content = fs.readFileSync(filepath, "utf8");
          content.split(/\n/).forEach((line) => {
            if (line.trim().length && !line.trim().startsWith("#")) {
              const [from, to] = line.split("\t");
              // Express turns ALL URLs into lowercase. So we have to do
              // this here too to have any chance matching.
              if (from.toLowerCase() === url.toLowerCase()) {
                return to;
              }
            }
          });
        });
    });

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
