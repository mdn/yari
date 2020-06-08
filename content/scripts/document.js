const fs = require("fs");
const path = require("path");

const fm = require("front-matter");
const yaml = require("js-yaml");

const { VALID_LOCALES } = require("./constants");
const { slugToFoldername } = require("./utils");

function buildPath(localeFolder, slug) {
  return path.join(localeFolder, slugToFoldername(slug));
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

function saveFile(folder, rawHtml, { slug, title, summary }) {
  const combined = `---\n${yaml.safeDump({
    slug,
    title,
    summary,
  })}---\n${rawHtml.trim()}\n`;
  fs.writeFileSync(getHTMLPath(folder), combined);
}

function trimLineEndings(string) {
  return string
    .split("\n")
    .map((s) => s.trimEnd())
    .join("\n");
}

function create(
  contentRoot,
  html,
  metadata,
  wikiHistory = null,
  rawHtml = null
) {
  const folder = buildPath(contentRoot, metadata.slug);

  fs.mkdirSync(folder, { recursive: true });

  saveFile(folder, trimLineEndings(html), metadata);

  // The `rawHtml` is only applicable in the importer when it saves
  // archived content. The archived content gets the *rendered* html
  // saved but by storing the raw html too we can potentially resurrect
  // the document if we decide to NOT archive it in the future.
  if (rawHtml) {
    fs.writeFileSync(path.join(folder, "raw.html"), trimLineEndings(rawHtml));
  }

  if (wikiHistory) {
    fs.writeFileSync(
      getWikiHistoryPath(folder),
      JSON.stringify(wikiHistory, null, 2)
    );
  }
}

const read = (contentRoot, folder, includeTimestamp = false) => {
  const filePath = getHTMLPath(folder);
  if (!fs.existsSync(filePath)) {
    return null;
  }
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

function rmdirIfEmpty(folder) {
  const dirIter = fs.opendirSync(folder);
  const isEmpty = !dirIter.readSync();
  dirIter.closeSync();
  if (isEmpty) {
    fs.rmdirSync(folder);
  }
}

function update(contentRoot, folder, rawHtml, metadata) {
  const document = read(contentRoot, folder);
  const isNewSlug = document.metadata.slug !== metadata.slug;

  if (
    isNewSlug ||
    document.rawHtml !== rawHtml ||
    document.metadata.title !== metadata.title ||
    document.metadata.summary !== metadata.summary
  ) {
    saveFile(folder, rawHtml, metadata);
  }

  if (isNewSlug) {
    const newFolder = buildPath(
      path.join(contentRoot, metadata.locale.toLowerCase()),
      metadata.slug
    );
    fs.mkdirSync(newFolder, { recursive: true });
    fs.renameSync(getHTMLPath(folder), getHTMLPath(newFolder));
    const oldWikiHistoryPath = getWikiHistoryPath(folder);
    if (fs.existsSync(oldWikiHistoryPath)) {
      fs.renameSync(oldWikiHistoryPath, getWikiHistoryPath(newFolder));
    }
    rmdirIfEmpty(folder);
  }
}

function del(folder) {
  fs.unlinkSync(getHTMLPath(folder));
  const wikiHistoryPath = getWikiHistoryPath(folder);
  fs.existsSync(wikiHistoryPath) && fs.unlinkSync(wikiHistoryPath);
  rmdirIfEmpty(folder);
}

module.exports = {
  buildPath,
  create,
  read,
  update,
  del,
};
