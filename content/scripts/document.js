const fs = require("fs");
const path = require("path");

const fm = require("front-matter");
const yaml = require("js-yaml");

const { VALID_LOCALES } = require("./constants");
const { slugToFoldername } = require("./utils");

function buildPath(contentPath, slug) {
  return path.join(contentPath, slugToFoldername(slug));
}

const getHTMLPath = (folder) => path.join(folder, "index.html");
const getWikiHistoryPath = (folder) => path.join(folder, "wikihistory.json");

function extractLocale(contentRoot, folder) {
  // E.g. 'pt-br/web/foo'
  const relativeToSource = path.relative(contentRoot, folder);
  // E.g. 'pr-br'
  const localeFolderName = relativeToSource.split(path.sep)[0];
  // E.g. 'pt-BR'
  const locale = VALID_LOCALES.get(localeFolderName);
  // This checks that the extraction worked *and* that the locale found
  // really is in VALID_LOCALES *and* it ultimately returns the
  // locale as we prefer to spell it (e.g. 'pt-BR' not 'Pt-bR')
  if (!locale) {
    throw new Error(`Unable to figure out locale from ${folder}`);
  }
  return locale;
}

function saveFile(folder, rawHtml, metadata) {
  const combined = `---\n${yaml.safeDump(metadata)}---\n${rawHtml.trim()}\n`;
  fs.writeFileSync(path.join(folder, "index.html"), combined);
}

function create(contentRoot, rawHtml, metadata, wikiHistory = null) {
  const folder = buildPath(contentRoot, metadata.slug);

  fs.mkdirSync(folder, { recursive: true });

  saveFile(folder, rawHtml, metadata);

  if (wikiHistory) {
    fs.writeFileSync(
      getWikiHistoryPath(folder),
      JSON.stringify(wikiHistory, null, 2)
    );
  }
}

const read = (contentRoot, folder, includeTimestamp = false) => {
  const filePath = getHTMLPath(folder);
  const {
    attributes: metadata,
    body: rawHtml,
    bodyBegin: frontMatterOffset,
  } = fm(fs.readFileSync(filePath, "utf8"));

  if (includeTimestamp) {
    metadata.modified = null;
    const wikiHistoryPath = getWikiHistoryPath(folder);
    if (fs.existsSync(wikiHistoryPath)) {
      const wikiMetadata = JSON.parse(
        fs.readFileSync(wikiHistoryPath, "utf-8")
      );
      metadata.modified = wikiMetadata.modified;
    }
  }

  metadata.locale = extractLocale(contentRoot, folder);

  return {
    metadata,
    rawHtml,
    fileInfo: {
      path: filePath,
      frontMatterOffset,
    },
  };
};

function update(contentRoot, folder, rawHtml, metadata) {
  const document = read(contentRoot, folder);
  if (
    document.rawHtml !== rawHtml ||
    document.metadata.title !== metadata.title ||
    document.metadata.summary !== metadata.summary
  ) {
    saveFile(folder, rawHtml, metadata);
  }
}

function del(folder) {
  fs.unlinkSync(getHTMLPath(folder));
  fs.unlinkSync(getWikiHistoryPath(folder));
  const dirIter = fs.opendirSync(folder);
  const isEmpty = !dirIter.readSync();
  dirIter.closeSync();
  if (isEmpty) {
    fs.rmdirSync(folder);
  }
}

module.exports = {
  buildPath,
  create,
  read,
  update,
  del,
};
