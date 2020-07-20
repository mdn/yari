const path = require("path");

const sanitizeFilename = require("sanitize-filename");

function buildURL(locale, slug) {
  if (!locale) throw new Error("locale falsy!");
  if (!slug) throw new Error("slug falsy!");
  return `/${locale}/docs/${slug}`.toLowerCase();
}

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

function memoizeDuringBuild(fn) {
  if (process.env.NODE_ENV === "development") {
    return fn;
  }

  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const value = fn(...args);
    cache.set(key, value);
    return value;
  };
}

module.exports = {
  buildURL,
  slugToFoldername,
  memoizeDuringBuild,
};
