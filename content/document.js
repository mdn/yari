const fs = require("fs");
const path = require("path");

const fm = require("front-matter");
const glob = require("glob");
const yaml = require("js-yaml");

const {
  CONTENT_ARCHIVE_ROOT,
  CONTENT_ROOT,
  VALID_LOCALES,
} = require("./constants");
const { memoize, slugToFoldername } = require("./utils");

function buildPath(localeFolder, slug) {
  return path.join(localeFolder, slugToFoldername(slug));
}

const HTML_FILENAME = "index.html";
const getHTMLPath = (folder) => path.join(folder, HTML_FILENAME);
const getWikiHistoryPath = (folder) => path.join(folder, "wikihistory.json");

function updateWikiHistory(localeContentRoot, oldSlug, newSlug = null) {
  const all = JSON.parse(
    fs.readFileSync(path.join(localeContentRoot, "_wikihistory.json"))
  );
  if (oldSlug in all) {
    if (newSlug) {
      all[newSlug] = all[oldSlug];
    }
    delete all[oldSlug];
    fs.writeFileSync(
      path.join(localeContentRoot, "_wikihistory.json"),
      JSON.stringify(all, null, 2)
    );
  }
}

function extractLocale(folder) {
  // E.g. 'pr-br'
  const localeFolderName = folder.split(path.sep)[0];
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

function saveHTMLFile(filePath, rawHtml, { slug, title, summary, tags }) {
  const metadata = {
    title,
    slug,
    summary,
  };
  if (tags) {
    metadata.tags = tags;
  }
  const combined = `---\n${yaml.safeDump(metadata)}---\n${rawHtml.trim()}\n`;
  fs.writeFileSync(filePath, combined);
}

function trimLineEndings(string) {
  return string
    .split("\n")
    .map((s) => s.trimEnd())
    .join("\n");
}

function urlToFolderPath(url) {
  const [, locale, , ...slugParts] = url.split("/");
  return path.join(locale.toLowerCase(), slugToFoldername(slugParts.join("/")));
}

function create(html, metadata) {
  const folderPath = buildPath(
    path.join(CONTENT_ROOT, metadata.locale),
    metadata.slug
  );

  fs.mkdirSync(folderPath, { recursive: true });

  saveHTMLFile(getHTMLPath(folderPath), trimLineEndings(html), metadata);
}

function archive(renderedHTML, rawHTML, metadata, wikiHistory) {
  const folderPath = buildPath(
    path.join(CONTENT_ARCHIVE_ROOT, metadata.locale),
    metadata.slug
  );

  fs.mkdirSync(folderPath, { recursive: true });

  // The `rawHtml` is only applicable in the importer when it saves
  // archived content. The archived content gets the *rendered* html
  // saved but by storing the raw html too we can potentially resurrect
  // the document if we decide to NOT archive it in the future.
  fs.writeFileSync(path.join(folderPath, "raw.html"), trimLineEndings(rawHTML));

  fs.writeFileSync(
    getWikiHistoryPath(folderPath),
    JSON.stringify(wikiHistory, null, 2)
  );

  saveHTMLFile(
    getHTMLPath(folderPath),
    trimLineEndings(renderedHTML),
    metadata
  );
}

class Document {
  constructor(attributes) {
    Object.assign(this, attributes);
  }

  get url() {
    const { locale, slug } = this.metadata;
    return `/${locale}/docs/${slug}`;
  }
}

const read = memoize((folder, fields = null) => {
  fields = fields ? { body: false, metadata: false, ...fields } : fields;
  const filePath = path.join(CONTENT_ROOT, getHTMLPath(folder));
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const rawContent = fs.readFileSync(filePath, "utf8");
  const {
    attributes: metadata,
    body: rawHtml,
    bodyBegin: frontMatterOffset,
  } = fm(rawContent);

  metadata.locale = extractLocale(folder);

  return new Document({
    ...(!fields || fields.metadata ? { metadata } : {}),
    ...(!fields || fields.body ? { rawHtml, rawContent } : {}),
    fileInfo: {
      folder,
      path: filePath,
      frontMatterOffset,
    },
  });
});

function update(folder, rawHtml, metadata) {
  const folderPath = path.join(CONTENT_ROOT, getHTMLPath(folder));
  const document = read(folder);
  const oldSlug = document.metadata.slug;
  const newSlug = metadata.slug;
  const isNewSlug = oldSlug !== newSlug;

  if (
    isNewSlug ||
    document.rawHtml !== rawHtml ||
    document.metadata.title !== metadata.title ||
    document.metadata.summary !== metadata.summary
  ) {
    saveHTMLFile(folderPath, rawHtml, {
      ...document.metadata,
      ...metadata,
    });
    if (isNewSlug) {
      updateWikiHistory(
        path.join(CONTENT_ROOT, metadata.locale.toLowerCase()),
        oldSlug,
        newSlug
      );
    }
  }

  if (isNewSlug) {
    for (const { metadata, rawHtml, fileInfo } of findChildren(url)) {
      const oldChildSlug = metadata.slug;
      const newChildSlug = oldChildSlug.replace(oldSlug, newSlug);
      metadata.slug = newChildSlug;
      updateWikiHistory(
        path.join(CONTENT_ROOT, metadata.locale.toLowerCase()),
        oldChildSlug,
        newChildSlug
      );
      saveHTMLFile(fileInfo.path, rawHtml, metadata);
    }
    const newFolderPath = buildPath(
      path.join(CONTENT_ROOT, metadata.locale.toLowerCase()),
      newSlug
    );

    // XXX we *could* call out to a shell here and attempt
    // to execute `git mv $folder $newFolder` and only if that didn't work
    // do we fall back on good old `fs.renameSync`.
    fs.renameSync(folderPath, newFolderPath);
  }
}

function del(folder) {
  const { metadata, fileInfo } = read(folder, { metadata: true });
  fs.rmdirSync(path.dirname(fileInfo.path), { recursive: true });
  updateWikiHistory(path.join(CONTENT_ROOT, metadata.locale), metadata.slug);
}

const findByURL = memoize((url, fields = null) => {
  const folder = urlToFolderPath(url);

  const document = read(folder, fields);

  return document ? { contentRoot: CONTENT_ROOT, folder, document } : null;
});

function findAll() {
  // TODO: doesn't support archive content yet
  const filePaths = glob.sync(path.join(CONTENT_ROOT, "**", HTML_FILENAME));
  return {
    count: filePaths.length,
    iter: function* () {
      for (const filePath of filePaths) {
        yield read(path.relative(CONTENT_ROOT, path.dirname(filePath)));
      }
    },
  };
}

function findChildren(url, fields = null) {
  const folder = urlToFolderPath(url);
  const childPaths = glob.sync(
    path.join(CONTENT_ROOT, folder, "*", HTML_FILENAME)
  );
  return childPaths
    .map((childFilePath) =>
      path.relative(CONTENT_ROOT, path.dirname(childFilePath))
    )
    .map((folder) => read(folder, fields));
}

module.exports = {
  create,
  archive,
  read,
  update,
  del,

  findByURL,
  findAll,
  findChildren,
};
