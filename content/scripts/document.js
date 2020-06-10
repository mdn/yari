const fs = require("fs");
const path = require("path");

const fm = require("front-matter");
const glob = require("glob");
const yaml = require("js-yaml");

const { VALID_LOCALES } = require("./constants");
const { slugToFoldername } = require("./utils");

function buildPath(localeFolder, slug) {
  return path.join(localeFolder, slugToFoldername(slug));
}

const HTML_FILENAME = "index.html";
const getHTMLPath = (folder) => path.join(folder, HTML_FILENAME);
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

function saveHTMLFile(filePath, rawHtml, attributes) {
  const combined = `---\n${yaml.safeDump(attributes)}---\n${rawHtml.trim()}\n`;
  fs.writeFileSync(filePath, combined);
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

  saveHTMLFile(getHTMLPath(folder), trimLineEndings(html), metadata);

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

function update(contentRoot, folder, rawHtml, metadata) {
  const document = read(contentRoot, folder);
  const oldSlug = document.metadata.slug;
  const newSlug = metadata.slug;
  const isNewSlug = oldSlug !== newSlug;

  if (
    isNewSlug ||
    document.rawHtml !== rawHtml ||
    document.metadata.title !== metadata.title ||
    document.metadata.summary !== metadata.summary
  ) {
    saveHTMLFile(getHTMLPath(folder), rawHtml, metadata);
  }

  if (isNewSlug) {
    const childFilePaths = glob.sync(path.join(folder, "**", HTML_FILENAME));
    for (const childFilePath of childFilePaths) {
      const { attributes, body } = fm(fs.readFileSync(childFilePath, "utf8"));
      attributes.slug = attributes.slug.replace(oldSlug, newSlug);
      saveHTMLFile(childFilePath, body, attributes);
    }
    const newFolder = buildPath(
      path.join(contentRoot, metadata.locale.toLowerCase()),
      newSlug
    );
    fs.renameSync(folder, newFolder);
  }
}

function del(folder) {
  fs.rmdirSync(folder);
}

module.exports = {
  buildPath,
  create,
  read,
  update,
  del,
};
