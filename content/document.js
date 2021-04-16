const fs = require("fs");
const path = require("path");

const fm = require("front-matter");
const glob = require("glob");
const yaml = require("js-yaml");
const { fdir } = require("fdir");

const {
  CONTENT_ARCHIVED_ROOT,
  CONTENT_TRANSLATED_ROOT,
  CONTENT_ROOT,
  ACTIVE_LOCALES,
  VALID_LOCALES,
  ROOTS,
} = require("./constants");
const { getPopularities } = require("./popularities");
const { getWikiHistories } = require("./wikihistories");
const { getGitHistories } = require("./githistories");

const {
  buildURL,
  getRoot,
  memoize,
  slugToFolder,
  execGit,
  urlToFolderPath,
  MEMOIZE_INVALIDATE,
} = require("./utils");
const Redirect = require("./redirect");

function buildPath(localeFolder, slug) {
  return path.join(localeFolder, slugToFolder(slug));
}

const HTML_FILENAME = "index.html";
const getHTMLPath = (folder) => path.join(folder, HTML_FILENAME);
const MARKDOWN_FILENAME = "index.md";
const getMarkdownPath = (folder) => path.join(folder, MARKDOWN_FILENAME);

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
      `Unable to figure out locale from '${folder}' with '${localeFolderName}'`
    );
  }
  return locale;
}

function saveFile(
  filePath,
  rawBody,
  { slug, title, translation_of, tags, translation_of_original, original_slug }
) {
  if (slug.includes("#")) {
    throw new Error("newSlug can not contain the '#' character");
  }
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
  if (translation_of_original) {
    // This will only make sense during the period where we're importing from
    // MySQL to disk. Once we're over that period we can delete this if-statement.
    metadata.translation_of_original = translation_of_original;
  }
  if (original_slug) {
    metadata.original_slug = original_slug;
  }
  const combined = `---\n${yaml.dump(metadata)}---\n${rawBody.trim()}\n`;
  fs.writeFileSync(filePath, combined);
}

function trimLineEndings(string) {
  return string
    .split("\n")
    .map((s) => s.trimEnd())
    .join("\n");
}

function createHTML(html, metadata, root = null) {
  const folderPath = getFolderPath(metadata, root);

  fs.mkdirSync(folderPath, { recursive: true });

  saveFile(getHTMLPath(folderPath), trimLineEndings(html), metadata);
  return folderPath;
}

function createMarkdown(md, metadata, root = null) {
  const folderPath = getFolderPath(metadata, root);

  fs.mkdirSync(folderPath, { recursive: true });

  saveFile(getMarkdownPath(folderPath), trimLineEndings(md), metadata);
  return folderPath;
}

function getFolderPath(metadata, root = null) {
  if (!root) {
    root = getRoot(metadata.locale);
  }
  return buildPath(
    path.join(root, metadata.locale.toLowerCase()),
    metadata.slug
  );
}

function archive(
  renderedHTML,
  rawBody,
  metadata,
  isMarkdown = false,
  isTranslatedContent = false,
  root = null
) {
  if (!root) {
    root = isTranslatedContent
      ? CONTENT_TRANSLATED_ROOT
      : CONTENT_ARCHIVED_ROOT;
  }
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

  // The `rawBody` is only applicable in the importer when it saves
  // archived content. The archived content gets the *rendered* html
  // saved but by storing the raw HTML/Markdown too we can potentially resurrect
  // the document if we decide to NOT archive it in the future.
  if (rawBody) {
    fs.writeFileSync(
      path.join(folderPath, isMarkdown ? "raw.md" : "raw.html"),
      trimLineEndings(rawBody)
    );
  }

  saveFile(getHTMLPath(folderPath), trimLineEndings(renderedHTML), metadata);
  return folderPath;
}

function unarchive(document, move) {
  // You can't use `document.rawBody` because, rather confusingly,
  // it's actually the rendered (from the migration) HTML. Instead,
  // you need seek out the `raw.html` equivalent and use that.
  // This is because when we ran the migration, for every document we
  // archived, we created a `index.html` file (front-matter and rendered
  // HTML) and a `raw.html` file (kumascript raw HTML).
  const rawFilePath = path.join(
    path.dirname(document.fileInfo.path),
    "raw.html"
  );
  const rawHTML = fs.readFileSync(rawFilePath, "utf-8");
  const created = createHTML(rawHTML, document.metadata);
  if (move) {
    execGit(["rm", document.fileInfo.path], {}, CONTENT_ARCHIVED_ROOT);
    execGit(["rm", rawFilePath], {}, CONTENT_ARCHIVED_ROOT);
  }
  return created;
}

const read = memoize((folderOrFilePath) => {
  let filePath = null;
  let folder = null;
  let root = null;
  let isMarkdown = false;
  let locale = null;

  if (fs.existsSync(folderOrFilePath)) {
    filePath = folderOrFilePath;

    for (const possibleRoot of ROOTS) {
      if (filePath.startsWith(possibleRoot)) {
        root = possibleRoot;
        folder = filePath
          .replace(possibleRoot + path.sep, "")
          .replace(path.sep + HTML_FILENAME, "")
          .replace(path.sep + MARKDOWN_FILENAME, "");
        locale = extractLocale(filePath.replace(possibleRoot + path.sep, ""));
        break;
      }
    }
  } else {
    folder = folderOrFilePath;
    for (const possibleRoot of ROOTS) {
      const possibleHTMLFilePath = path.join(possibleRoot, getHTMLPath(folder));
      if (fs.existsSync(possibleHTMLFilePath)) {
        root = possibleRoot;
        filePath = possibleHTMLFilePath;
        break;
      }
      const possibleMarkdownFilePath = path.join(
        possibleRoot,
        getMarkdownPath(folder)
      );
      if (fs.existsSync(possibleMarkdownFilePath)) {
        root = possibleRoot;
        filePath = possibleMarkdownFilePath;
        isMarkdown = true;
        break;
      }
    }
    if (!filePath) {
      return;
    }
    locale = extractLocale(folder);
  }

  if (filePath.includes(" ")) {
    throw new Error("Folder contains whitespace which is not allowed.");
  }
  if (filePath.includes("\u200b")) {
    throw new Error(
      `Folder contains zero width whitespace which is not allowed (${filePath})`
    );
  }
  // Use Boolean() because otherwise, `isTranslated` might become `undefined`
  // rather than an actuall boolean value.
  const isTranslated = Boolean(
    CONTENT_TRANSLATED_ROOT && filePath.startsWith(CONTENT_TRANSLATED_ROOT)
  );
  const isArchive =
    CONTENT_ARCHIVED_ROOT && filePath.startsWith(CONTENT_ARCHIVED_ROOT);

  const rawContent = fs.readFileSync(filePath, "utf8");
  if (!rawContent) {
    throw new Error(`${filePath} is an empty file`);
  }

  // This is very useful in CI where every page gets built. If there's an
  // accidentally unresolved git conflict, that's stuck in the content,
  // bail extra early.
  if (
    // If the document itself, is a page that explains and talks about git merge
    // conflicts, i.e. a false positive, those angled brackets should be escaped
    /^<<<<<<< HEAD\n/m.test(rawContent) &&
    /^=======\n/m.test(rawContent) &&
    /^>>>>>>>/m.test(rawContent)
  ) {
    throw new Error(`${filePath} contains git merge conflict markers`);
  }

  const {
    attributes: metadata,
    body: rawBody,
    bodyBegin: frontMatterOffset,
  } = fm(rawContent);

  const url = `/${locale}/docs/${metadata.slug}`;

  const isActive = !isArchive && ACTIVE_LOCALES.has(locale.toLowerCase());

  // The last-modified is always coming from the git logs. Independent of
  // which root it is.
  const gitHistory = getGitHistories(root, locale).get(
    path.relative(root, filePath)
  );
  let modified = null;
  let hash = null;
  if (gitHistory) {
    if (
      gitHistory.merged &&
      gitHistory.merged.modified &&
      gitHistory.merged.hash
    ) {
      modified = gitHistory.merged.modified;
      hash = gitHistory.merged.hash;
    } else {
      modified = gitHistory.modified;
      hash = gitHistory.hash;
    }
  }
  // Use the wiki histories for a list of legacy contributors.
  const wikiHistory = getWikiHistories(root, locale).get(url);
  if (!modified && wikiHistory && wikiHistory.modified) {
    modified = wikiHistory.modified;
  }
  const fullMetadata = {
    metadata: {
      ...metadata,
      locale,
      popularity: getPopularities().get(url) || 0.0,
      modified,
      hash,
      contributors: wikiHistory ? wikiHistory.contributors : [],
    },
    url,
  };

  return {
    ...fullMetadata,
    // ...{ rawContent },
    rawContent, // HTML or Markdown whole string with all the front-matter
    rawBody, // HTML or Markdown string without the front-matter
    isMarkdown,
    isArchive,
    isTranslated,
    isActive,
    fileInfo: {
      folder,
      path: filePath,
      frontMatterOffset,
      root,
    },
  };
});

function update(url, rawBody, metadata) {
  const folder = urlToFolderPath(url);
  const document = read(folder);
  const locale = document.metadata.locale;
  const root = getRoot(locale);
  const oldSlug = document.metadata.slug;
  const newSlug = metadata.slug;
  const isNewSlug = oldSlug !== newSlug;
  const indexPath = path.join(
    root,
    document.isMarkdown ? getMarkdownPath(folder) : getHTMLPath(folder)
  );

  if (
    isNewSlug ||
    document.rawBody !== rawBody ||
    document.metadata.title !== metadata.title
  ) {
    saveFile(indexPath, rawBody, {
      ...document.metadata,
      ...metadata,
    });
    if (isNewSlug) {
      updateWikiHistory(
        path.join(root, metadata.locale.toLowerCase()),
        oldSlug,
        newSlug
      );
    }
  }

  if (isNewSlug) {
    const locale = metadata.locale;
    const redirects = new Map();
    const url = buildURL(locale, oldSlug);
    for (const { metadata, rawBody, fileInfo } of findChildren(url, true)) {
      const childLocale = metadata.locale;
      const oldChildSlug = metadata.slug;
      const newChildSlug = oldChildSlug.replace(oldSlug, newSlug);
      metadata.slug = newChildSlug;
      updateWikiHistory(
        path.join(root, metadata.locale.toLowerCase()),
        oldChildSlug,
        newChildSlug
      );
      saveFile(fileInfo.path, rawBody, metadata);
      redirects.set(
        buildURL(childLocale, oldChildSlug),
        buildURL(childLocale, newChildSlug)
      );
    }
    redirects.set(buildURL(locale, oldSlug), buildURL(locale, newSlug));
    const newFolderPath = buildPath(
      path.join(root, locale.toLowerCase()),
      newSlug
    );
    const oldFolderPath = buildPath(
      path.join(root, locale.toLowerCase()),
      oldSlug
    );

    if (oldFolderPath !== newFolderPath) {
      execGit(["mv", oldFolderPath, newFolderPath], { cwd: root });
    }
    Redirect.add(locale, [...redirects.entries()]);
  }
}

function findByURL(url, ...args) {
  const [bareURL, hash = ""] = url.split("#", 2);
  if (!bareURL.toLowerCase().includes("/docs/")) {
    return;
  }
  const doc = read(urlToFolderPath(bareURL), ...args);
  if (doc && hash) {
    return { ...doc, url: `${doc.url}#${hash}` };
  }
  return doc;
}

function findAll({
  files = new Set(),
  folderSearch = null,
  locales = new Map(),
} = {}) {
  if (!(files instanceof Set)) {
    throw new TypeError("'files' not a Set");
  }
  if (folderSearch && typeof folderSearch !== "string") {
    throw new TypeError("'folderSearch' not a string");
  }
  const folderSearchRegExp = folderSearch ? new RegExp(folderSearch) : null;

  const filePaths = [];
  const roots = [];
  if (CONTENT_ARCHIVED_ROOT) {
    roots.push(CONTENT_ARCHIVED_ROOT);
  }
  if (CONTENT_TRANSLATED_ROOT) {
    roots.push(CONTENT_TRANSLATED_ROOT);
  }
  roots.push(CONTENT_ROOT);
  for (const root of roots) {
    const api = new fdir()
      // .withFullPaths()
      .withBasePath()
      // .withDirs()
      .filter((filePath, isDirectory) => {
        if (isDirectory) {
          throw new Error("ever???");
          return true;
        } else if (
          filePath.endsWith(HTML_FILENAME) ||
          filePath.endsWith(MARKDOWN_FILENAME)
        ) {
          if (locales.size) {
            const locale = filePath.replace(root, "").split("/")[1];
            return locales.get(locale);
          }
          // The 'files' set is either a list of absolute full paths or a
          // list of endings.
          // Why endings? Because it's highly useful when you use git and the
          // filepath might be relative to the git repo root.
          if (files.size) {
            if (files.has(filePath)) {
              return true;
            }
            for (const fp of files) {
              if (filePath.endsWith(fp)) {
                return true;
              }
            }
            return false;
          }

          if (folderSearchRegExp) {
            const pure = filePath
              .replace(root + path.sep, "")
              .replace(HTML_FILENAME, "")
              .replace(MARKDOWN_FILENAME, "");
            return pure.search(folderSearchRegExp) !== -1;
          }

          return true;
        }
        return false;
      })
      .crawl(root);
    filePaths.push(...api.sync());
  }
  return {
    count: filePaths.length,
    *iter({ pathOnly = false } = {}) {
      for (const filePath of filePaths) {
        yield pathOnly ? filePath : read(filePath);
      }
    },
  };
}

function XXXfindAll({
  files = new Set(),
  folderSearch = null,
  locales = new Map(),
} = {}) {
  if (!(files instanceof Set)) throw new TypeError("'files' not a Set");
  if (folderSearch && typeof folderSearch !== "string")
    throw new TypeError("'folderSearch' not a string");

  const filePaths = [];
  const roots = [];
  if (CONTENT_ARCHIVED_ROOT) {
    roots.push(CONTENT_ARCHIVED_ROOT);
  }
  if (CONTENT_TRANSLATED_ROOT) {
    roots.push(CONTENT_TRANSLATED_ROOT);
  }
  roots.push(CONTENT_ROOT);
  for (const root of roots) {
    const searchPattern = [""];
    if (locales.size) {
      const localePrefixes = [];
      for (const [locale, include] of locales) {
        if (!include) {
          throw new Error("ability to exclude locales is not supported yet");
        }
        localePrefixes.push(locale);
      }
      searchPattern.push(`+(${localePrefixes.join("|")})`);
    }
    searchPattern.push("**");
    searchPattern.push("index.{html,md}");
    filePaths.push(
      ...glob
        .sync(searchPattern.join(path.sep), { root })
        .filter((filePath) => {
          // The 'files' set is either a list of absolute full paths or a
          // list of endings.
          // Why endings? Because it's highly useful when you use git and the
          // filepath might be relative to the git repo root.
          if (files.size) {
            if (files.has(filePath)) {
              return true;
            }
            for (const fp of files) {
              if (filePath.endsWith(fp)) {
                return true;
              }
            }
            return false;
          }
          if (folderSearch) {
            return (
              filePath
                .replace(CONTENT_ROOT, "")
                .replace(CONTENT_TRANSLATED_ROOT, "")
                .replace(HTML_FILENAME, "")
                .replace(MARKDOWN_FILENAME, "")
                .search(new RegExp(folderSearch)) !== -1
            );
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
    *iter({ pathOnly = false } = {}) {
      for (const filePath of filePaths) {
        yield pathOnly ? filePath : read(filePath);
      }
    },
  };
}

function findChildren(url, recursive = false) {
  const locale = url.split("/")[1];
  const root = getRoot(locale);
  const folder = urlToFolderPath(url);
  const globber = recursive ? ["*", "**"] : ["*"];
  const childPaths = glob.sync(
    path.join(root, folder, ...globber, HTML_FILENAME)
  );
  return childPaths
    .map((childFilePath) => path.relative(root, path.dirname(childFilePath)))
    .map((folder) => read(folder));
}

function move(oldSlug, newSlug, locale, { dry = false } = {}) {
  const oldUrl = buildURL(locale, oldSlug);
  const doc = findByURL(oldUrl);
  if (!doc) {
    throw new Error(`document for ${oldSlug} does not exist`);
  }
  const newParentSlug = parentSlug(newSlug);
  // Otherwise we have a top level slug.
  if (newParentSlug) {
    const newParent = findByURL(buildURL(locale, newParentSlug));
    if (!newParent) {
      throw new Error(`Parent document for ${newSlug} does not exist`);
    }
  }

  const realOldSlug = doc.metadata.slug;
  const pairs = [doc, ...findChildren(oldUrl, true)].map(({ metadata }) => [
    metadata.slug,
    metadata.slug.replace(realOldSlug, newSlug),
  ]);
  if (dry) {
    return pairs;
  }

  doc.metadata.slug = newSlug;
  update(oldUrl, doc.rawBody, doc.metadata);

  return pairs;
}

function fileForSlug(slug, locale) {
  return getHTMLPath(getFolderPath({ slug, locale }));
}

function exists(slug, locale) {
  return Boolean(read(buildPath(locale.toLowerCase(), slug)));
}

function parentSlug(slug) {
  return slug.split("/").slice(0, -1).join("/");
}

function validate(slug, locale) {
  const errors = [];
  const file = buildPath(locale.toLowerCase(), slug);

  const doc = read(file);

  if (doc.metadata.slug.toLowerCase() !== slug.toLowerCase()) {
    errors.push("slug mismatch");
  }
  // Add more validations here.

  if (errors.length > 0) {
    throw new Error(errors.join(", "));
  }
}

function remove(
  slug,
  locale,
  { recursive = false, dry = false, redirect = "" } = {}
) {
  const root = getRoot(locale);
  const url = buildURL(locale, slug);
  const { metadata, fileInfo } = findByURL(url) || {};
  if (!metadata) {
    throw new Error(`document does not exists: ${url}`);
  }

  const children = findChildren(url, true);
  if (children.length > 0 && (redirect || !recursive)) {
    throw new Error("unable to remove and redirect a document with children");
  }
  const docs = [slug, ...children.map(({ metadata }) => metadata.slug)];

  if (dry) {
    return docs;
  }

  const removed = [];
  for (const { metadata } of children) {
    const slug = metadata.slug;
    updateWikiHistory(path.join(root, metadata.locale.toLowerCase()), slug);
    removed.push(buildURL(locale, slug));
  }

  execGit(["rm", "-r", path.dirname(fileInfo.path)], { cwd: root });

  if (redirect) {
    Redirect.add(locale, [[url, redirect]]);
  } else {
    Redirect.remove(locale, [url, ...removed]);
  }

  updateWikiHistory(
    path.join(root, metadata.locale.toLowerCase()),
    metadata.slug
  );

  return docs;
}

module.exports = {
  createHTML,
  createMarkdown,
  archive,
  unarchive,
  read,
  update,
  exists,
  remove,
  move,
  validate,

  urlToFolderPath,
  getFolderPath,
  fileForSlug,
  parentSlug,

  updateWikiHistory,
  trimLineEndings,
  saveFile,

  findByURL,
  findAll,
  // findAll2,
  findChildren,

  MEMOIZE_INVALIDATE,
};
