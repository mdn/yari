const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const { slugToFoldername } = require("./utils");

function buildPath(contentPath, slug) {
  return path.join(contentPath, slugToFoldername(slug));
}

const htmlPath = (folder) => path.join(folder, "index.html");
const metaPath = (folder) => path.join(folder, "index.yaml");
const wikiHistoryPath = (folder) => path.join(folder, "wikihistory.json");

function create(contentPath, html, meta, wikiHistory = null) {
  const folder = buildPath(contentPath, meta.slug);

  fs.mkdirSync(folder, { recursive: true });

  fs.writeFileSync(htmlPath(folder), html);
  fs.writeFileSync(metaPath(folder), yaml.safeDump(meta));

  if (wikiHistory) {
    fs.writeFileSync(
      wikiHistoryPath(folder),
      JSON.stringify(wikiHistory, null, 2)
    );
  }
}

const read = (folder) => ({
  html: fs.readFileSync(htmlPath(folder), "utf8"),
  meta: yaml.safeLoad(fs.readFileSync(metaPath(folder))),
});

function update(folder, html, meta) {
  const document = read(folder);
  if (document.html !== html) {
    fs.writeFileSync(htmlPath(folder), html);
  }
  if (
    document.meta.title !== meta.title ||
    document.meta.summary !== meta.summary
  ) {
    const newMeta = { ...document.meta };
    newMeta.title = meta.title;
    newMeta.summary = meta.summary;
    fs.writeFileSync(metaPath(folder), yaml.safeDump(newMeta));
  }
}

function del(folder) {
  fs.unlinkSync(htmlPath(folder));
  fs.unlinkSync(metaPath(folder));
  fs.unlinkSync(wikiHistoryPath(folder));
  const dirIter = fs.opendirSync(folder);
  const isEmpty = !dirIter.readSync();
  dirIter.closeSync();
  if (isEmpty) {
    fs.rmdirSync(folder);
  }
}

module.exports = { buildPath, create, read, update, del };
