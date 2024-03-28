import sanitizeFilename from "sanitize-filename";

export function slugToFolder(slug, joiner = "/") {
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

export function decodePath(path) {
  const decoded = path.split("/").map(decodeURIComponent).join("/");
  return decoded;
}

export function encodePath(path) {
  const decoded = path.split("/").map(encodeURIComponent).join("/");
  return decoded;
}
