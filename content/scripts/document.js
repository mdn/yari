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

async function create(contentPath, html, meta, wikiHistory = null) {
  const folder = buildPath(contentPath, meta.slug);

  await fs.promises.mkdir(folder, { recursive: true });

  await fs.promises.writeFile(htmlPath(folder), html);
  await fs.promises.writeFile(metaPath(folder), yaml.safeDump(meta));

  if (wikiHistory) {
    await fs.promises.writeFile(
      wikiHistoryPath(folder),
      JSON.stringify(wikiHistory, null, 2)
    );
  }
}

const read = async (folder) => ({
  html: await fs.promises.readFile(htmlPath(folder), "utf8"),
  meta: await yaml.safeLoad(await fs.promises.readFile(metaPath(folder))),
});

async function update(folder, html, meta) {
  const document = await read(folder);
  if (document.html !== html) {
    await fs.promises.writeFile(htmlPath(folder), html);
  }
  if (
    document.meta.title !== meta.title ||
    document.meta.summary !== meta.summary
  ) {
    const newMeta = { ...document.meta };
    newMeta.title = meta.title;
    newMeta.summary = meta.summary;
    await fs.promises.writeFile(metaPath(folder), yaml.safeDump(newMeta));
  }
}

async function del(folder) {
  await fs.promises.unlink(htmlPath(folder));
  await fs.promises.unlink(metaPath(folder));
  await fs.promises.unlink(wikiHistoryPath(folder));
  const dirIter = await fs.promises.opendir(folder);
  const isEmpty = !(await dirIter.read());
  await dirIter.close();
  if (isEmpty) {
    await fs.promises.rmdir(folder);
  }
}

module.exports = { buildPath, create, read, update, del };
