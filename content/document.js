const fs = require("fs");
const path = require("path");

const fm = require("front-matter");
const glob = require("glob");
const yaml = require("js-yaml");

const {
  CONTENT_ARCHIVED_ROOT,
  CONTENT_TRANSLATED_ROOT,
  CONTENT_ROOT,
  VALID_LOCALES,
  ROOTS,
} = require("./constants");
const { getPopularities } = require("./popularities");
const { getWikiHistories } = require("./wikihistories");

const { memoize, slugToFolder } = require("./utils");

function buildPath(localeFolder, slug) {
  return path.join(localeFolder, slugToFolder(slug));
}

const HTML_FILENAME = "index.html";
const getHTMLPath = (folder) => path.join(folder, HTML_FILENAME);

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
  const localeFolderName = folder.split(path.sep)[0].toLowerCase();
  // E.g. 'pt-BR'
  const locale = VALID_LOCALES.get(localeFolderName);
  // This checks that the extraction worked *and* that the locale found
  // really is in VALID_LOCALES *and* it ultimately returns the
  // locale as we prefer to spell it (e.g. 'pt-BR' not 'Pt-bR')
  if (!locale) {
    throw new Error(
      `Unable to figure out locale from ${folder} with ${localeFolderName}`
    );
  }
  return locale;
}

function saveHTMLFile(
  filePath,
  rawHTML,
  { slug, title, translation_of, tags }
) {
  const metadata = {
    title,
    slug,
  };
  if (tags) {
    metadata.tags = tags;
  }
  if (translation_of) {
    metadata.translation_of = translation_of;
  }
  const combined = `---\n${yaml.safeDump(metadata)}---\n${rawHTML.trim()}\n`;
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
  return path.join(locale.toLowerCase(), slugToFolder(slugParts.join("/")));
}

function create(html, metadata) {
  const folderPath = getFolderPath(metadata);

  fs.mkdirSync(folderPath, { recursive: true });

  saveHTMLFile(getHTMLPath(folderPath), trimLineEndings(html), metadata);
}

function getFolderPath(metadata) {
  const root =
    metadata.locale === "en-US" ? CONTENT_ROOT : CONTENT_TRANSLATED_ROOT;
  return buildPath(
    path.join(root, metadata.locale.toLowerCase()),
    metadata.slug
  );
}

function archive(renderedHTML, rawHTML, metadata, isTranslatedContent = false) {
  const root = isTranslatedContent
    ? CONTENT_TRANSLATED_ROOT
    : CONTENT_ARCHIVED_ROOT;
  if (!CONTENT_ARCHIVED_ROOT) {
    throw new Error("Can't archive when CONTENT_ARCHIVED_ROOT is not set");
  }
  if (isTranslatedContent && !CONTENT_TRANSLATED_ROOT) {
    throw new Error(
      "Can't archive translated content when CONTENT_TRANSLATED_ROOT is not set"
    );
  }
  const folderPath = buildPath(
    path.join(root, metadata.locale.toLowerCase()),
    metadata.slug
  );

  fs.mkdirSync(folderPath, { recursive: true });

  // The `rawHTML` is only applicable in the importer when it saves
  // archived content. The archived content gets the *rendered* html
  // saved but by storing the raw html too we can potentially resurrect
  // the document if we decide to NOT archive it in the future.
  fs.writeFileSync(path.join(folderPath, "raw.html"), trimLineEndings(rawHTML));

  saveHTMLFile(
    getHTMLPath(folderPath),
    trimLineEndings(renderedHTML),
    metadata
  );
}

const read = memoize((folder) => {
  let filePath = null;
  let root = null;
  for (const possibleRoot of ROOTS) {
    const possibleFilePath = path.join(possibleRoot, getHTMLPath(folder));
    if (fs.existsSync(possibleFilePath)) {
      root = possibleRoot;
      filePath = possibleFilePath;
      break;
    }
  }
  if (!filePath) {
    return;
  }
  const isTranslated =
    CONTENT_TRANSLATED_ROOT && filePath.startsWith(CONTENT_TRANSLATED_ROOT);
  const isArchive =
    isTranslated ||
    (CONTENT_ARCHIVED_ROOT && filePath.startsWith(CONTENT_ARCHIVED_ROOT));

  const rawContent = fs.readFileSync(filePath, "utf8");
  const {
    attributes: metadata,
    body: rawHTML,
    bodyBegin: frontMatterOffset,
  } = fm(rawContent);

  const locale = extractLocale(folder);
  const url = `/${locale}/docs/${metadata.slug}`;
  const wikiHistories = getWikiHistories(root, locale);
  const fullMetadata = {
    metadata: {
      ...metadata,
      locale,
      popularity: getPopularities().get(url) || 0.0,
      modified: wikiHistories.has(url) ? wikiHistories.get(url).modified : null,
    },
    url,
  };

  return {
    ...fullMetadata,
    ...{ rawHTML, rawContent },
    isArchive,
    isTranslated,
    fileInfo: {
      folder,
      path: filePath,
      frontMatterOffset,
      root,
    },
  };
});

function update(folder, rawHTML, metadata) {
  const folderPath = path.join(CONTENT_ROOT, getHTMLPath(folder));
  const document = read(folder);
  const oldSlug = document.metadata.slug;
  const newSlug = metadata.slug;
  const isNewSlug = oldSlug !== newSlug;

  if (
    isNewSlug ||
    document.rawHTML !== rawHTML ||
    document.metadata.title !== metadata.title
  ) {
    saveHTMLFile(folderPath, rawHTML, {
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
    for (const { metadata, rawHTML, fileInfo } of findChildren(url)) {
      const oldChildSlug = metadata.slug;
      const newChildSlug = oldChildSlug.replace(oldSlug, newSlug);
      metadata.slug = newChildSlug;
      updateWikiHistory(
        path.join(CONTENT_ROOT, metadata.locale.toLowerCase()),
        oldChildSlug,
        newChildSlug
      );
      saveHTMLFile(fileInfo.path, rawHTML, metadata);
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
  const { metadata, fileInfo } = read(folder);
  fs.rmdirSync(path.dirname(fileInfo.path), { recursive: true });
  updateWikiHistory(path.join(CONTENT_ROOT, metadata.locale), metadata.slug);
}

const findByURL = (url, ...args) => read(urlToFolderPath(url), ...args);

function findAll(
  { files, folderSearch } = { files: new Set(), folderSearch: null }
) {
  if (!files instanceof Set) throw new TypeError("'files' not a Set");
  if (folderSearch && typeof folderSearch !== "string")
    throw new TypeError("'folderSearch' not a string");

  // TODO: doesn't support archive content yet
  // console.warn("Currently hardcoded to only build 'en-us'");
  const filePaths = [];
  const roots = [];
  if (CONTENT_ARCHIVED_ROOT) {
    // roots.push({ path: CONTENT_ARCHIVED_ROOT, isArchive: true });
    roots.push(CONTENT_ARCHIVED_ROOT);
  }
  if (CONTENT_TRANSLATED_ROOT) {
    roots.push(CONTENT_TRANSLATED_ROOT);
  }
  roots.push(CONTENT_ROOT);
  console.log("Building roots:", roots);
  for (const root of roots) {
    filePaths.push(
      ...glob
        .sync(path.join(root, "**", HTML_FILENAME))
        .filter((filePath) => {
          // The 'files' set is either a list of absolute full paths or a
          // list of endings.
          // Why endings? Because it's highly useful when you use git and the
          // filepath might be relative to the git repo root.
          if (files.size) {
            if (files.has(filePath)) {
              return true;
            }
            for (fp of files) {
              if (filePath.endsWith(fp)) {
                return true;
              }
            }
            return false;
          }
          if (folderSearch) {
            return filePath
              .replace(CONTENT_ROOT, "")
              .replace(HTML_FILENAME, "")
              .includes(folderSearch);
          }
          return true;
        })
        .map((filePath) => {
          return path.relative(root, path.dirname(filePath));
        })
    );
  }
  return {
    count: filePaths.length,
    iter: function* () {
      for (const filePath of filePaths) {
        yield read(filePath);
      }
    },
  };
}

function findChildren(url) {
  const folder = urlToFolderPath(url);
  const childPaths = glob.sync(
    path.join(CONTENT_ROOT, folder, "*", HTML_FILENAME)
  );
  return childPaths
    .map((childFilePath) =>
      path.relative(CONTENT_ROOT, path.dirname(childFilePath))
    )
    .map((folder) => read(folder));
}

module.exports = {
  create,
  archive,
  read,
  update,
  del,
  urlToFolderPath,
  getFolderPath,

  findByURL,
  findAll,
  findChildren,
};
