const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const { slugToFoldername } = require("./utils");

function buildPath(contentPath, slug) {
  return path.join(contentPath, slugToFoldername(slug));
}

async function create(contentPath, html, meta, wikiHistory = null) {
  const folder = buildPath(contentPath, meta.slug);
  await fs.promises.mkdir(folder, { recursive: true });

  await fs.promises.writeFile(path.join(folder, "index.html"), html);

  await fs.promises.writeFile(
    path.join(folder, "index.yaml"),
    yaml.safeDump(meta)
  );

  if (wikiHistory) {
    await fs.promises.writeFile(
      path.join(folder, "wikihistory.json"),
      JSON.stringify(wikiHistory, null, 2)
    );
  }
}

module.exports = { buildPath, create };
