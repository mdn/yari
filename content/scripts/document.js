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

const read = (
  contentRoot,
  folder,
  includeTimestamp = false,
  allWikiHistory
) => {
  const filePath = getHTMLPath(folder);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const rawContent = fs.readFileSync(filePath, "utf8");
  const {
    attributes: metadata,
    body: rawHtml,
    bodyBegin: frontMatterOffset,
  } = fm(rawContent);
  // Make a (shallow) clone of the metadata in case we need the metadata
  // as it appears in the source before we add extra pieces of information.
  // This is useful if you want to re-save the file as it *was*.
  const metadataUntouched = Object.assign({}, metadata);

  metadata.locale = extractLocale(contentRoot, folder);

  if (includeTimestamp) {
    // XXX the day we have a way of extracting the last modified date from
    // git log data, it'd go here. Somewhere.
    // At that point, every file will have a last modified from git (even
    // though it was ever *edited* with a git commit) because it was *added*
    // at some point.
    // So we'd need to make that git log such that it never includes edits
    // until after the critical day we make the final migration.

    metadata.modified = null;

    // const mdn_url = buildMDNUrl(metadata.locale, metadata.slug);
    // const uri = mdn_url.toLowerCase();
    if (!allWikiHistory.size) {
      throw new Error("allWikiHistory hasn't been populated");
    }
    const localeHistory = allWikiHistory.get(metadata.locale.toLowerCase());
    const slugLC = metadata.slug.toLowerCase();
    if (localeHistory.has(slugLC)) {
      metadata.modified = localeHistory.get(slugLC).modified;
    }
  }

  return {
    metadata,
    metadataUntouched,
    rawHtml,
    rawContent,
    fileInfo: {
      path: filePath,
      frontMatterOffset,
      updateFlaw: (flaw) => {
        // This is used to update flaws with this information.
        flaw.filepath = filePath;
        // The extra `- 1` is because of the added newline that
        // is only present because of the serialized linebreak.
        flaw.updateOffset(frontMatterOffset - 1);
        return flaw;
      },
    },
  };
};

function update(contentRoot, folder, rawHtml, metadata) {
  const document = read(contentRoot, folder);
  const oldSlug = document.metadata.slug;
  const newSlug = metadata.slug;
  const isNewSlug = oldSlug !== newSlug;

  const htmlPath = getHTMLPath(folder);
  if (
    isNewSlug ||
    document.rawHtml !== rawHtml ||
    document.metadata.title !== metadata.title ||
    document.metadata.summary !== metadata.summary
  ) {
    saveHTMLFile(htmlPath, rawHtml, { ...document.metadata, ...metadata });
    if (isNewSlug) {
      updateWikiHistory(
        path.join(contentRoot, metadata.locale.toLowerCase()),
        oldSlug,
        newSlug
      );
    }
  }

  if (isNewSlug) {
    const childFilePaths = glob.sync(path.join(folder, "**", HTML_FILENAME), {
      ignore: htmlPath, // The current document's slug is already updated above
    });
    for (const childFilePath of childFilePaths) {
      const { attributes, body } = fm(fs.readFileSync(childFilePath, "utf8"));
      const oldChildSlug = attributes.slug;
      const newChildSlug = oldChildSlug.replace(oldSlug, newSlug);
      attributes.slug = newChildSlug;
      updateWikiHistory(
        path.join(contentRoot, metadata.locale.toLowerCase()),
        oldChildSlug,
        newChildSlug
      );
      saveHTMLFile(childFilePath, body, attributes);
    }
    const newFolder = buildPath(
      path.join(contentRoot, metadata.locale.toLowerCase()),
      newSlug
    );

    // XXX we *could* call out to a shell here and attempt
    // to execute `git mv $folder $newFolder` and only if that didn't work
    // do we fall back on good old `fs.renameSync`.
    fs.renameSync(folder, newFolder);
  }
}

function del(contentRoot, folder) {
  const { metadata } = read(contentRoot, folder);
  fs.rmdirSync(folder, { recursive: true });
  updateWikiHistory(path.join(contentRoot, metadata.locale), metadata.slug);
}

module.exports = {
  buildPath,
  create,
  read,
  update,
  del,
};
