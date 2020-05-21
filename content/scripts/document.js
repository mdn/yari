const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const { slugToFoldername } = require("./utils");

function buildPath(contentPath, slug) {
  return path.join(contentPath, slugToFoldername(slug));
}

async function create(contentPath, html, meta, wikiHistory = null) {
  const folder = buildPath(contentPath, meta.slug);
  fs.mkdirSync(folder, { recursive: true });

  fs.writeFileSync(path.join(folder, "index.html"), html);

  fs.writeFileSync(path.join(folder, "index.yaml"), yaml.safeDump(meta));

  if (wikiHistory) {
    fs.writeFileSync(
      path.join(folder, "wikihistory.json"),
      JSON.stringify(wikiHistory, null, 2)
    );
  }
}

module.exports = { buildPath, create };
