const sanitizeFilename = require("sanitize-filename");

function slugToFolder(slug, joiner = "/") {
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
      .join(joiner)
  );
}

function decodePath(path) {
  const decoded = path.split("/").map(decodeURIComponent).join("/");
  return decoded;
}

function encodePath(path) {
  const decoded = path.split("/").map(encodeURIComponent).join("/");
  return decoded;
}

module.exports = {
  slugToFolder,
  decodePath,
  encodePath,
};
