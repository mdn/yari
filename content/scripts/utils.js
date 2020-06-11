const fs = require("fs");
const path = require("path");

const sanitizeFilename = require("sanitize-filename");

function slugToFoldername(slug) {
  return (
    slug
      // We have slugs with these special characters that would be
      // removed by the sanitizeFilename() function. What might then
      // happen is that it leads to two *different slugs* becoming
      // *same* folder name.
      .replace(/\*/g, "_star_")
      .replace(/::/g, "_doublecolon_")
      .replace(/:/g, "_colon_")
      .replace(/\?/g, "_question_")

      .toLowerCase()
      .split("/")
      .map(sanitizeFilename)
      .join(path.sep)
  );
}

function writeRedirects(localeFolder, pairs) {
  const filePath = path.join(localeFolder, "_redirects.txt");
  const writeStream = fs.createWriteStream(filePath);
  writeStream.write(`# FROM-URL\tTO-URL\n`);
  pairs.forEach(([fromUrl, toUrl]) => {
    writeStream.write(`${fromUrl}\t${toUrl}\n`);
  });
  writeStream.end();
}

module.exports = {
  slugToFoldername,
  writeRedirects,
};
