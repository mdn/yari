const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const { slugToFoldername } = require("./utils");

function buildPath(contentPath, slug) {
  return path.join(contentPath, slugToFoldername(slug));
}

function create(contentPath, html, metadata, wikiHistory = null) {
  const folder = buildPath(contentPath, metadata.slug);
  fs.mkdirSync(folder, { recursive: true });

  saveFile(path.join(folder, "index.html"), html, metadata);

  if (wikiHistory) {
    fs.writeFileSync(
      path.join(folder, "wikihistory.json"),
      JSON.stringify(wikiHistory, null, 2)
    );
  }
}

function saveFile(filePath, html, metadata) {
  const combined = `---\n${yaml.safeDump(metadata)}\n---\n${html.trim()}\n`;
  fs.writeFileSync(filePath, combined);
}

module.exports = { buildPath, create, saveFile };
