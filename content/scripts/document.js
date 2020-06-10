const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const { slugToFoldername } = require("./utils");

function buildPath(contentPath, slug) {
  return path.join(contentPath, slugToFoldername(slug));
}

function trimLineEndings(string) {
  return string
    .split("\n")
    .map((s) => s.trimEnd())
    .join("\n");
}

function create(
  contentPath,
  html,
  metadata,
  wikiHistory = null,
  rawHtml = null
) {
  const folder = buildPath(contentPath, metadata.slug);
  fs.mkdirSync(folder, { recursive: true });

  saveFile(path.join(folder, "index.html"), trimLineEndings(html), metadata);

  // The `rawHtml` is only applicable in the importer when it saves
  // archived content. The archived content gets the *rendered* html
  // saved but by storing the raw html too we can potentially resurrect
  // the document if we decide to NOT archive it in the future.
  if (rawHtml) {
    fs.writeFileSync(path.join(folder, "raw.html"), trimLineEndings(rawHtml));
  }

  if (wikiHistory) {
    fs.writeFileSync(
      path.join(folder, "wikihistory.json"),
      JSON.stringify(wikiHistory, null, 2)
    );
  }
}

function saveFile(filePath, html, metadata) {
  const combined = `---\n${yaml.safeDump(metadata)}---\n${html.trim()}\n`;
  fs.writeFileSync(filePath, combined);
}

module.exports = { buildPath, create, saveFile };
