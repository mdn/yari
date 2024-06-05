import fs from "node:fs";
import path from "node:path";
import util from "node:util";

import fm from "front-matter";
import yaml from "js-yaml";
import { fdir, PathsOutput } from "fdir";

import {
  CONTENT_TRANSLATED_ROOT,
  CONTENT_ROOT,
  ROOTS,
} from "../libs/env/index.js";
import {
  ACTIVE_LOCALES,
  HTML_FILENAME,
  MARKDOWN_FILENAME,
  VALID_LOCALES,
} from "../libs/constants/index.js";
import { isValidLocale } from "../libs/locale-utils/index.js";
import { getPopularities } from "./popularities.js";
import { getWikiHistories } from "./wikihistories.js";
import { getGitHistories } from "./githistories.js";
import { childrenFoldersForPath } from "./document-paths.js";

import {
  buildURL,
  getRoot,
  memoize,
  slugToFolder,
  execGit,
  urlToFolderPath,
  toPrettyJSON,
  MEMOIZE_INVALIDATE,
} from "./utils.js";
import * as Redirect from "./redirect.js";
import { DocFrontmatter, UnbuiltDocument } from "../libs/types/document.js";

export { urlToFolderPath, MEMOIZE_INVALIDATE } from "./utils.js";

function buildPath(localeFolder: string, slug: string) {
  return path.join(localeFolder, slugToFolder(slug));
}

const getHTMLPath = (folder: string) => path.join(folder, HTML_FILENAME);
const getMarkdownPath = (folder: string) =>
  path.join(folder, MARKDOWN_FILENAME);

export async function updateWikiHistory(
  localeContentRoot: string,
  oldSlug: string,
  newSlug: string | null = null
) {
  const all = JSON.parse(
    fs
      .readFileSync(path.join(localeContentRoot, "_wikihistory.json"))
      .toString()
  );
  if (oldSlug in all) {
    if (newSlug) {
      all[newSlug] = all[oldSlug];
    }
    delete all[oldSlug];
    // The reason we also sort them so that the new additions don't always
    // get appended to the end. The reason that matters is because two independent
    // PRs might make edits to this file (i.e. two PRs that both move documents)
    // and by default, the new entries will be added to the bottom of the
    // file. So by making it sorted, the location of adding new entries will
    // not cause git merge conflicts.
    const sorted = Object.fromEntries(
      Object.keys(all)
        .sort()
        .map((key) => {
          return [key, all[key]];
        })
    );
    fs.writeFileSync(
      path.join(localeContentRoot, "_wikihistory.json"),
      // The reason for the trailing newline is in case some ever opens the file
      // and makes an edit, their editor will most likely force-insert a
      // trailing newline character. So always doing in automation removes
      // the risk of a conflict at the last line from two independent PRs
      // that edit this file.
      await toPrettyJSON(sorted)
    );
  }
}

function extractLocale(folder: string) {
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

export function saveFile(
  filePath: string,
  rawBody: string,
  metadata,
  frontMatterKeys: string[] = []
) {
  const requiredFrontMatterKeys = ["title", "slug"];
  const optionalFrontMatterKeys = [
    "page-type",
    "tags",
    "original_slug",
    "browser-compat",
    "l10n",
  ];

  const saveMetadata = {};

  for (const key of requiredFrontMatterKeys) {
    if (!metadata[key]) {
      throw new Error(`'${key}' metadata must be truthy`);
    }
    saveMetadata[key] = metadata[key];
  }
  for (const key of optionalFrontMatterKeys) {
    if (metadata[key]) {
      saveMetadata[key] = metadata[key];
    }
  }
  // If the 'frontMatterKeys' is passed, the caller knows exactly which other
  // fields are expected from the metadata. For example 'browser-compat'.
  // These are not necessarily "required" but key should definitely be set.
  for (const key of frontMatterKeys || []) {
    saveMetadata[key] = metadata[key];
  }

  // Special extra sanity check
  if (metadata.slug.includes("#")) {
    throw new Error("newSlug can not contain the '#' character");
  }

  const folderPath = path.dirname(filePath);
  fs.mkdirSync(folderPath, { recursive: true });

  const combined = `---\n${yaml.dump(saveMetadata, {
    lineWidth: -1, // do not break lines
    quotingType: '"',
  })}---\n\n${rawBody.trim()}\n`;
  fs.writeFileSync(filePath, combined);
}

export function trimLineEndings(string) {
  return string
    .split("\n")
    .map((s) => s.trimEnd())
    .join("\n");
}

export function createHTML(html: string, metadata, root = null) {
  const folderPath = getFolderPath(metadata, root);

  saveFile(getHTMLPath(folderPath), trimLineEndings(html), metadata);
  return folderPath;
}

export function createMarkdown(
  md: string,
  metadata,
  root: string | null = null
) {
  const folderPath = getFolderPath(metadata, root);

  saveFile(getMarkdownPath(folderPath), trimLineEndings(md), metadata);
  return folderPath;
}

export function getFolderPath(metadata, root: string | null = null) {
  if (!root) {
    root = getRoot(metadata.locale);
  }
  return buildPath(
    path.join(root, metadata.locale.toLowerCase()),
    metadata.slug
  );
}

export const read = memoize(
  (folderOrFilePath: string, ...roots: string[]): UnbuiltDocument => {
    if (roots.length === 0) {
      roots = ROOTS;
    }
    let filePath: string = null;
    let folder: string = null;
    let root: string = null;
    let locale: string = null;

    if (fs.existsSync(folderOrFilePath)) {
      filePath = folderOrFilePath;

      // It exists, but it is sane?
      if (
        !(
          filePath.endsWith(HTML_FILENAME) ||
          filePath.endsWith(MARKDOWN_FILENAME)
        )
      ) {
        throw new Error(`'${filePath}' is not a HTML or Markdown file.`);
      }

      root = roots.find((possibleRoot) => filePath.startsWith(possibleRoot));
      if (root) {
        folder = filePath
          .replace(root + path.sep, "")
          .replace(path.sep + HTML_FILENAME, "")
          .replace(path.sep + MARKDOWN_FILENAME, "");
        locale = extractLocale(filePath.replace(root + path.sep, ""));
      } else {
        // The file exists but it doesn't appear to belong to any of our roots.
        // That could happen if you pass in a file that is something completely
        // different not a valid file anyway.
        throw new Error(
          `'${filePath}' does not appear to exist in any known content roots.`
        );
      }
    } else {
      folder = folderOrFilePath;
      for (const possibleRoot of roots) {
        const possibleMarkdownFilePath = path.join(
          possibleRoot,
          getMarkdownPath(folder)
        );
        if (fs.existsSync(possibleMarkdownFilePath)) {
          root = possibleRoot;
          filePath = possibleMarkdownFilePath;
          break;
        }
        const possibleHTMLFilePath = path.join(
          possibleRoot,
          getHTMLPath(folder)
        );
        if (fs.existsSync(possibleHTMLFilePath)) {
          root = possibleRoot;
          filePath = possibleHTMLFilePath;
          break;
        }
      }
      if (!filePath) {
        return;
      }
      locale = extractLocale(folder);
    }

    if (folder.includes(" ")) {
      throw new Error(
        `Folder contains whitespace which is not allowed (${util.inspect(
          filePath
        )})`
      );
    }
    if (folder.includes("\u200b")) {
      throw new Error(
        `Folder contains zero width whitespace which is not allowed (${filePath})`
      );
    }
    // Use Boolean() because otherwise, `isTranslated` might become `undefined`
    // rather than an actual boolean value.
    const isTranslated = Boolean(
      CONTENT_TRANSLATED_ROOT && filePath.startsWith(CONTENT_TRANSLATED_ROOT)
    );

    const rawContent = fs.readFileSync(filePath, "utf-8");
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
    } = fm<DocFrontmatter>(rawContent);

    const url = `/${locale}/docs/${metadata.slug}`;

    const isActive = ACTIVE_LOCALES.has(locale.toLowerCase());

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
        // This is our chance to record and remember which keys were actually
        // dug up from the front-matter.
        // It matters because the keys in front-matter are arbitrary.
        // Meaning, if a document contains `foo: bar` as a front-matter key/value
        // we need to take note of that and make sure we preserve that if we
        // save the metadata back (e.g. fixable flaws).
        frontMatterKeys: Object.keys(metadata),
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
      isMarkdown: filePath.endsWith(MARKDOWN_FILENAME),
      isTranslated,
      isActive,
      fileInfo: {
        folder,
        path: filePath,
        frontMatterOffset,
        root,
      },
    };
  }
);

export async function update(url: string, rawBody: string, metadata) {
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

  const { frontMatterKeys } = metadata;

  if (
    isNewSlug ||
    document.rawBody !== rawBody ||
    document.metadata.title !== metadata.title
  ) {
    saveFile(
      indexPath,
      rawBody,
      {
        ...document.metadata,
        ...metadata,
      },
      frontMatterKeys
    );
    if (isNewSlug) {
      await updateWikiHistory(
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
      await updateWikiHistory(
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

export function findByURL(
  url: string,
  ...args: (string | typeof MEMOIZE_INVALIDATE)[]
) {
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

export async function findAll({
  files = new Set<string>(),
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

  const filePaths: string[] = [];
  const roots: string[] = [];
  if (CONTENT_TRANSLATED_ROOT) {
    roots.push(CONTENT_TRANSLATED_ROOT);
  }
  roots.push(CONTENT_ROOT);
  for (const root of roots) {
    const api = new fdir()
      .withFullPaths()
      .withErrors()
      .filter((filePath) => {
        // Exit early if it's not a sane kind of file we expect
        if (
          !(
            filePath.endsWith(HTML_FILENAME) ||
            filePath.endsWith(MARKDOWN_FILENAME)
          )
        ) {
          return false;
        }

        const locale = filePath.replace(root, "").split(path.sep)[1];
        if (!isValidLocale(locale)) {
          return false;
        }
        if (locales.size) {
          if (!locales.get(locale)) {
            return false;
          }
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
      })
      .crawl(root);
    const output: PathsOutput = await api.withPromise();
    filePaths.push(...output);
  }
  return {
    count: filePaths.length,
    *iterPaths() {
      for (const filePath of filePaths) {
        yield filePath;
      }
    },
    *iterDocs() {
      for (const filePath of filePaths) {
        yield read(filePath);
      }
    },
  };
}

export function findChildren(url: string, recursive = false) {
  const locale = url.split("/")[1];
  const root = getRoot(locale);
  const folder = urlToFolderPath(url);

  const childPaths = childrenFoldersForPath(root, folder, recursive);
  return childPaths.map((folder) => read(folder));
}

export async function move(
  oldSlug: string,
  newSlug: string,
  locale: string,
  { dry = false } = {}
) {
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
  await update(oldUrl, doc.rawBody, doc.metadata);

  return pairs;
}

export function fileForSlug(slug: string, locale: string) {
  return getMarkdownPath(getFolderPath({ slug, locale }));
}

export function exists(slug: string, locale: string) {
  return Boolean(read(buildPath(locale.toLowerCase(), slug)));
}

export function parentSlug(slug: string) {
  return slug.split("/").slice(0, -1).join("/");
}

export function validate(slug: string, locale: string) {
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

export async function remove(
  slug: string,
  locale: string,
  { recursive = false, dry = false, redirect = "" } = {}
) {
  const root = getRoot(locale, `cannot find root of locale: ${locale}`);
  const url = buildURL(locale, slug);
  let redirectUrl = redirect;
  if (redirect && !redirect.match("^http(s)?://")) {
    redirectUrl = buildURL(locale, redirect);
  }

  const { metadata, fileInfo } = findByURL(url, root) || {};
  if (!metadata) {
    throw new Error(`document does not exists: ${url}`);
  }

  const children = findChildren(url, true);
  if (children.length > 0 && redirect && !recursive) {
    throw new Error("unable to remove and redirect a document with children");
  }
  const docs = [slug, ...children.map(({ metadata }) => metadata.slug)];

  if (dry) {
    if (redirectUrl) {
      Redirect.add(locale, [[url, redirectUrl]], { dry });
    }
    return docs;
  }

  const removed = [];
  for (const { metadata } of children) {
    const slug = metadata.slug;
    await updateWikiHistory(
      path.join(root, metadata.locale.toLowerCase()),
      slug
    );
    removed.push(buildURL(locale, slug));
  }

  execGit(["rm", "-r", path.dirname(fileInfo.path)], { cwd: root });

  if (redirectUrl) {
    Redirect.add(locale, [
      [url, redirectUrl],
      ...children.map(
        ({ url: childUrl }) => [childUrl, redirectUrl] as [string, string]
      ),
    ]);
  } else {
    Redirect.remove(locale, [url, ...removed]);
  }

  await updateWikiHistory(
    path.join(root, metadata.locale.toLowerCase()),
    metadata.slug
  );

  return docs;
}
