import fs from "node:fs";
import path from "node:path";

import express from "express";
import { fdir } from "fdir";
import { execSync, spawn } from "node:child_process";

import { getPopularities, Document, Translation } from "../content/index.js";
import {
  VALID_LOCALES,
  ACTIVE_LOCALES,
  DEFAULT_LOCALE,
} from "../libs/constants/index.js";
import { CONTENT_ROOT, CONTENT_TRANSLATED_ROOT } from "../libs/env/index.js";
import { getLastCommitURL } from "../build/index.js";
import LANGUAGES_RAW from "../libs/languages/index.js";
import { isValidLocale } from "../libs/locale-utils/index.js";
import { UnbuiltDocument } from "../libs/types/document.js";

export const router = express.Router();

// Module-level cache
const allPopularityValues = [];

function getAllPopularityValues() {
  if (!allPopularityValues.length) {
    for (const value of getPopularities().values()) {
      allPopularityValues.push(value);
    }
  }
  return allPopularityValues;
}

function replaceSepPerOS(slug: string) {
  if (path.sep !== "/") {
    // In other words, we're on Windows
    return slug.replace(/\//g, "\\\\");
  } else {
    return slug;
  }
}

function packageTranslationDifferences(translationDifferences) {
  let total = 0;
  const countByType = {};
  translationDifferences.forEach((difference) => {
    if (!(difference.type in countByType)) {
      countByType[difference.type] = 0;
    }
    if (
      difference.explanationNotes &&
      Array.isArray(difference.explanationNotes)
    ) {
      total += difference.explanationNotes.length;
      countByType[difference.type] += difference.explanationNotes.length;
    } else {
      total++;
      countByType[difference.type]++;
    }
  });
  return { total, countByType };
}

type RecentRepoHashType = string;

const _foundDocumentsCache = new Map();
const sourceCommitCache = fs.existsSync("./source-commit.json")
  ? new Map<string, number | RecentRepoHashType>(
      Object.entries(
        JSON.parse(fs.readFileSync("./source-commit.json", "utf8"))
      )
    )
  : new Map<string, number>();
const commitFiles = new Map<string, string[]>();
let commitFilesOldest = "HEAD";
export async function findDocuments({ locale }) {
  function checkCacheValidation(prevCache: Map<any, any>): void {
    const contentHash = getRecentRepoHash(CONTENT_ROOT);
    const translatedContentHash = getRecentRepoHash(CONTENT_TRANSLATED_ROOT);

    function getRecentRepoHash(cwd: string): string {
      return execSync("git rev-parse HEAD", { cwd }).toString().trimEnd();
    }
    function updateRecentRepoHash(cache: Map<string, any>): void {
      cache.set(CONTENT_ROOT, contentHash);
      cache.set(CONTENT_TRANSLATED_ROOT, translatedContentHash);
    }
    function isValidCache(cache: Map<string, any>): boolean {
      return (
        cache.has(CONTENT_ROOT) &&
        cache.has(CONTENT_TRANSLATED_ROOT) &&
        cache.get(CONTENT_ROOT) === contentHash &&
        cache.get(CONTENT_TRANSLATED_ROOT) === translatedContentHash
      );
    }

    if (isValidCache(sourceCommitCache)) {
      return;
    }
    if (!isValidCache(prevCache)) {
      prevCache.clear();
      sourceCommitCache.clear();
      commitFiles.clear();
      commitFilesOldest = "HEAD";
      updateRecentRepoHash(prevCache);
      updateRecentRepoHash(sourceCommitCache);
    }
  }

  const counts = {
    // Number of documents found that aren't skipped
    found: 0,
    // Number of documents encountered prior to filters.
    total: 0,
    // Translated documents that can't be linked to its English parent
    noParent: 0,
    // Because the function uses the filepath and the file modification time,
    // it can be useful to know how much the cache failed or succeeded.
    cacheMisses: 0,
  };

  const documents = [];

  const t1 = new Date();
  const documentsFound = await Document.findAll({
    locales: new Map([[locale, true]]),
  });
  counts.total = documentsFound.count;

  checkCacheValidation(_foundDocumentsCache);
  if (!_foundDocumentsCache.has(locale)) {
    _foundDocumentsCache.set(locale, new Map());
  }
  const cache = _foundDocumentsCache.get(locale);

  for (const filePath of documentsFound.iterPaths()) {
    const mtime = fs.statSync(filePath).mtime;

    if (!cache.has(filePath) || cache.get(filePath).mtime < mtime) {
      counts.cacheMisses++;
      const document = await getDocument(filePath);
      cache.set(filePath, {
        document,
        mtime,
      });
    }

    const { document } = cache.get(filePath);
    if (!document) {
      counts.noParent++;
      continue;
    }
    counts.found++;
    documents.push(document);
  }

  const t2 = new Date();
  const took = t2.getTime() - t1.getTime();

  const times = {
    took,
  };

  fs.writeFileSync(
    "./source-commit.json",
    JSON.stringify(Object.fromEntries(sourceCommitCache)),
    "utf8"
  );

  return {
    counts,
    times,
    documents,
  };
}

async function getDocument(filePath) {
  function packagePopularity(document, parentDocument) {
    return {
      value: document.metadata.popularity,
      ranking: document.metadata.popularity
        ? 1 +
          getAllPopularityValues().filter(
            (p) => p > document.metadata.popularity
          ).length
        : NaN,
      parentValue: parentDocument.metadata.popularity,
      parentRanking: parentDocument.metadata.popularity
        ? 1 +
          getAllPopularityValues().filter(
            (p) => p > parentDocument.metadata.popularity
          ).length
        : NaN,
    };
  }

  function recordInvalidSourceCommit(
    fileFolder: string,
    commitHash: string,
    message: string
  ) {
    const filePath = "./source-commit-invalid-report.txt";
    const errorMessage = `- ${commitHash} commit hash is invalid in ${fileFolder}: ${message.replace(
      /\n/g,
      " "
    )}`;
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, "");
    }

    fs.appendFile(filePath, `${errorMessage}\n`, function (err) {
      if (err) throw err;
    });
  }

  class GitError extends Error {
    constructor(stderr: string) {
      super(stderr);
      this.name = "GitError";
    }
  }

  function fillMemStore(commitHash: string) {
    return new Promise((resolve, reject) => {
      const git = spawn(
        "git",
        [
          "log",
          "--pretty=format:%x00%x00%H",
          "--name-only",
          "-z",
          `${commitHash}..${commitFilesOldest}`,
        ],
        {
          cwd: CONTENT_ROOT,
        }
      );

      let stdoutBuffer = "";

      git.stdout.on("data", (data) => {
        stdoutBuffer += data.toString();
        const commits = stdoutBuffer.split("\0\0");
        const partial = commits.pop();
        stdoutBuffer = partial;
        commits.forEach((commit) => {
          const [dirtyHash, files] = commit.split("\n");
          // necessary for commits following those with no changes:
          const hash = dirtyHash.replace(/\0/g, "");
          commitFiles.set(hash, files ? files.split("\0") : []);
        });
      });

      let stderr = "";

      git.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      git.on("close", (code) => {
        commitFilesOldest = commitHash;
        code ? reject(new GitError(stderr)) : resolve(null);
      });
    });
  }

  async function getCommitBehindFromLatest(
    fileFolder: string,
    parentFilePath: string,
    commitHash: string
  ): Promise<number> {
    if (sourceCommitCache.has(fileFolder)) {
      return sourceCommitCache.get(fileFolder) as number;
    }

    try {
      let count = 0;
      if (!commitFiles.has(commitHash)) {
        await fillMemStore(commitHash);
      }
      for (const [hash, files] of commitFiles.entries()) {
        if (hash === commitHash) {
          if (!files.includes(parentFilePath)) {
            recordInvalidSourceCommit(
              fileFolder,
              commitHash,
              "file isn't changed in this commit"
            );
          }
          break;
        }
        if (files.includes(parentFilePath)) count++;
      }
      sourceCommitCache.set(fileFolder, count);
    } catch (err) {
      if (err instanceof GitError) {
        recordInvalidSourceCommit(fileFolder, commitHash, err.message);
      } else {
        throw err;
      }
    }

    return sourceCommitCache.get(fileFolder) as number;
  }

  async function packageEdits(
    document: UnbuiltDocument,
    parentDocument: UnbuiltDocument
  ) {
    const {
      fileInfo: { root: fileRoot, folder: fileFolder },
      metadata: { hash: fileHash, modified, l10n },
    } = document as any;
    const {
      fileInfo: { root: parentFileRoot, path: parentFilePath },
      metadata: { hash: parentFileHash, modified: parentModified },
    } = parentDocument;

    const commitURL = getLastCommitURL(fileRoot, fileHash);
    const parentCommitURL = getLastCommitURL(parentFileRoot, parentFileHash);
    let sourceCommitURL;
    let sourceCommitsBehindCount;

    if (l10n?.sourceCommit) {
      sourceCommitURL = getLastCommitURL(CONTENT_ROOT, l10n.sourceCommit);
      sourceCommitsBehindCount = await getCommitBehindFromLatest(
        fileFolder,
        parentFilePath.replace(parentFileRoot, "files"),
        l10n.sourceCommit
      );
    }

    return {
      commitURL,
      parentCommitURL,
      modified,
      parentModified,
      sourceCommitURL,
      sourceCommitsBehindCount,
    };
  }

  // We can't just open the `index.json` and return it like that in the XHR
  // payload. It's too much stuff and some values need to be repackaged/
  // serialized or some other transformation computation.
  async function packageDocument(
    document: UnbuiltDocument,
    englishDocument: UnbuiltDocument,
    translationDifferences
  ) {
    const mdn_url = document.url;
    const { title } = document.metadata;
    const popularity = packagePopularity(document, englishDocument);
    const differences = packageTranslationDifferences(translationDifferences);
    const edits = await packageEdits(document, englishDocument);
    return { popularity, differences, edits, mdn_url, title };
  }

  const document = Document.read(filePath);
  const englishDocument = Document.read(
    document.fileInfo.folder.replace(
      document.metadata.locale.toLowerCase(),
      DEFAULT_LOCALE.toLowerCase()
    )
  );
  if (!englishDocument) {
    return;
  }

  const differences = [];
  for (const difference of Translation.getTranslationDifferences(
    englishDocument,
    document,
    true
  )) {
    differences.push(difference);
  }
  return await packageDocument(document, englishDocument, differences);
}

const _defaultLocaleDocumentsCache = new Map();

async function gatherL10NstatsSection({
  locale,
  mdnSection = "/",
  subSections = [],
}) {
  function packagePopularity(document) {
    return {
      value: document.metadata.popularity,
      ranking: document.metadata.popularity
        ? 1 +
          getAllPopularityValues().filter(
            (p) => p > document.metadata.popularity
          ).length
        : NaN,
    };
  }

  function packageEdits(document: UnbuiltDocument) {
    const commitURL = getLastCommitURL(
      document.fileInfo.root,
      document.metadata.hash
    );
    const modified = document.metadata.modified;
    return {
      commitURL,
      modified,
    };
  }

  function packageDocument(document: UnbuiltDocument) {
    const mdn_url = document.url;
    const { title } = document.metadata;
    const popularity = packagePopularity(document);
    const edits = packageEdits(document);
    return { mdn_url, title, popularity, edits };
  }

  const counts = {
    // Number of not-yet translated documents
    missing: 0,
    // Number of not-missing translated documents
    translated: 0,
    // Number missing and translated combined
    total: 0,
    // Number of articles whose commits are older than English on locale side
    outOfDate: 0,
    // Number of articles whose commits are newer than English
    upToDate: 0,
    // Because the function uses the filepath and the file modification time,
    // it can be useful to know how much the cache failed or succeeded.
    cacheMisses: 0,
  };

  const subSectionCounts = new Map();
  subSections.forEach((subSection) =>
    subSectionCounts.set(subSection, {
      missing: 0,
      translated: 0,
      total: 0,
      outOfDate: 0,
      upToDate: 0,
    })
  );
  if (locale === DEFAULT_LOCALE) {
    throw new Error("Can't run this for the default locale");
  }

  const missingDocuments = [];
  const outOfDateDocuments = [];
  const upToDateDocuments = [];

  const t1 = new Date();
  const folderSearch = replaceSepPerOS(
    locale + mdnSection.toLowerCase() + (mdnSection.endsWith("/") ? "" : "/")
  );

  const foundTranslations = await Document.findAll({
    locales: new Map([[locale, true]]),
    folderSearch,
  });

  const translatedFolderNames = new Set();
  for (const filePath of foundTranslations.iterPaths()) {
    const asFolder = path.relative(
      CONTENT_TRANSLATED_ROOT,
      path.dirname(filePath)
    );
    const asFolderWithoutLocale = asFolder
      .split(path.sep)
      .slice(1)
      .join(path.sep);
    translatedFolderNames.add(asFolderWithoutLocale);
  }
  const folderSearchDefaultLocale = replaceSepPerOS(
    DEFAULT_LOCALE.toLowerCase() +
      mdnSection.toLowerCase() +
      (mdnSection.endsWith("/") ? "" : "/")
  );

  const foundDefaultLocale = await Document.findAll({
    locales: new Map([[DEFAULT_LOCALE.toLowerCase(), true]]),
    folderSearch: folderSearchDefaultLocale,
  });

  for (const filePath of foundDefaultLocale.iterPaths()) {
    const asFolder = path.relative(CONTENT_ROOT, path.dirname(filePath));
    const asFolderWithoutLocale = asFolder
      .split(path.sep)
      .slice(1)
      .join(path.sep);

    counts.total++;
    const mtime = fs.statSync(filePath).mtime;
    if (
      !_defaultLocaleDocumentsCache.has(filePath) ||
      _defaultLocaleDocumentsCache.get(filePath).mtime < mtime
    ) {
      counts.cacheMisses++;
      const document = packageDocument(Document.read(filePath));
      _defaultLocaleDocumentsCache.set(filePath, {
        document,
        mtime,
      });
    }

    const { document } = _defaultLocaleDocumentsCache.get(filePath);
    let subSectionOfDoc = "";
    if (mdnSection !== "/") {
      const [, ...subSectionSplitDest] = document.mdn_url.split(mdnSection);
      const subSectionSplit = subSectionSplitDest.join(mdnSection);
      if (subSectionSplit) {
        subSectionOfDoc =
          mdnSection +
          subSectionSplit.split("/")[0] +
          "/" +
          subSectionSplit.split("/")[1];
      }
    } else {
      subSectionOfDoc = "/" + document.mdn_url.split(mdnSection)[3];
    }
    if (!translatedFolderNames.has(asFolderWithoutLocale)) {
      counts.missing++;
      if (subSectionCounts.has(subSectionOfDoc)) {
        subSectionCounts.get(subSectionOfDoc).missing++;
      }
      missingDocuments.push(document);
    } else {
      const translatedDocumentURL = document.mdn_url.replace(
        `/${DEFAULT_LOCALE}/`,
        `/${locale}/`
      );

      const translatedDocument = packageDocument(
        Document.findByURL(translatedDocumentURL)
      );
      if (
        new Date(translatedDocument.edits.modified) <
        new Date(document.edits.modified)
      ) {
        counts.outOfDate++;
        if (subSectionCounts.has(subSectionOfDoc)) {
          subSectionCounts.get(subSectionOfDoc).outOfDate++;
        }
        outOfDateDocuments.push({
          DEFAULT_LOCALE: document,
          locale: translatedDocument,
        });
      } else {
        counts.upToDate++;
        if (subSectionCounts.has(subSectionOfDoc)) {
          subSectionCounts.get(subSectionOfDoc).upToDate++;
        }
        upToDateDocuments.push({
          DEFAULT_LOCALE: document,
          locale: translatedDocument,
        });
      }
      if (subSectionCounts.has(subSectionOfDoc)) {
        subSectionCounts.get(subSectionOfDoc).translated++;
      }
      counts.translated++;
    }
  }

  counts.total = counts.translated + counts.missing;
  subSectionCounts.forEach((counts) => {
    counts.total = counts.translated + counts.missing;
  });

  const t2 = new Date();
  const took = t2.getTime() - t1.getTime();

  const times = {
    took,
  };

  return {
    counts,
    times,
    missingDocuments,
    outOfDateDocuments,
    upToDateDocuments,
    subSectionCounts,
  };
}

const _detailsSectionCache = new Map();

async function buildL10nDashboard({
  locale,
  section,
}: {
  locale: string;
  section: string;
}) {
  if (locale === DEFAULT_LOCALE) {
    throw new Error("Can't run this for the default locale");
  }

  if (!_detailsSectionCache.has(locale)) {
    _detailsSectionCache.set(locale, new Map());
  }
  const sectionDirPath = replaceSepPerOS(section);
  const defaultLocaleDocs = [
    ...(
      await Document.findAll({
        locales: new Map([[DEFAULT_LOCALE.toLowerCase(), true]]),
        folderSearch:
          DEFAULT_LOCALE.toLowerCase() + sectionDirPath.toLowerCase(),
      })
    ).iterDocs(),
  ];

  const subSectionsStartingWith = defaultLocaleDocs
    .map((doc) => doc.metadata.slug)
    .filter((slug) =>
      (slug + "/")
        .toLowerCase()
        .startsWith(
          section.toLowerCase().length === 1
            ? ""
            : section.toLowerCase().slice(1) + "/"
        )
    );

  const subSections = subSectionsStartingWith
    .filter((slug) => slug.split("/").length < section.split("/").length + 2) // We don't need the whole tree, only child and grand-child
    .filter((slug, _, slugs) => {
      const depthLevelTest =
        slug.split("/").length ===
        (section.length === 1 ? "" : section).split("/").length;
      const hasChildrenTest = slugs.some((e) => e.startsWith(slug + "/"));
      return depthLevelTest && hasChildrenTest;
    })
    .map((s) => "/" + s);

  const l10nStatsSection = await gatherL10NstatsSection({
    locale,
    mdnSection: section,
    subSections,
  });

  const l10nStatsSubsections = [];
  l10nStatsSection.subSectionCounts.forEach((val, key) => {
    l10nStatsSubsections.push({
      name: key.slice(1),
      l10nKPIs: val,
    });
  });

  const l10nKPIs = {
    missing: l10nStatsSection.counts.missing,
    outOfDate: l10nStatsSection.counts.outOfDate,
    total: l10nStatsSection.counts.total,
    upToDate: l10nStatsSection.counts.upToDate,
  };

  function filterChildrenDocs(url: string, section: string) {
    return (
      (section.length === 1 && url.split("/").length > 4) ||
      url.split("/").length > section.split("/").length + 3
    );
  }
  // Merge all documents (missing, out of date, up to date) into a single array
  const detailDocuments = [];
  l10nStatsSection.missingDocuments.forEach((document) => {
    // Filtering documents which belong directly for this section
    // we don't want to list all documents where viewing the
    // dashboard for "/"
    const defaultURL = document.mdn_url;
    if (filterChildrenDocs(defaultURL, section)) {
      return;
    }
    detailDocuments.push({
      url: defaultURL,
      info: {
        popularity: document.popularity,
        defaultLocaleInfo: document.edits,
      },
    });
  });

  l10nStatsSection.upToDateDocuments.forEach(({ DEFAULT_LOCALE, locale }) => {
    const defaultURL = DEFAULT_LOCALE.mdn_url;
    if (filterChildrenDocs(defaultURL, section)) {
      return;
    }
    detailDocuments.push({
      url: defaultURL,
      info: {
        popularity: DEFAULT_LOCALE.popularity,
        localePopularity: locale.popularity,
        defaultLocaleInfo: DEFAULT_LOCALE.edits,
        localeInfo: locale.edits,
      },
    });
  });

  l10nStatsSection.outOfDateDocuments.forEach(({ DEFAULT_LOCALE, locale }) => {
    const defaultURL = DEFAULT_LOCALE.mdn_url;
    if (filterChildrenDocs(defaultURL, section)) {
      return;
    }
    detailDocuments.push({
      url: defaultURL,
      info: {
        popularity: DEFAULT_LOCALE.popularity,
        localePopularity: locale.popularity,
        defaultLocaleInfo: DEFAULT_LOCALE.edits,
        localeInfo: locale.edits,
      },
    });
  });

  return {
    l10nKPIs,
    sections: l10nStatsSubsections,
    detailDocuments,
  };
}

router.get("/", async (req, res) => {
  if (!CONTENT_TRANSLATED_ROOT) {
    return res.status(500).send("CONTENT_TRANSLATED_ROOT not set");
  }

  const countsByLocale = await countFilesByLocale();

  const locales = [...VALID_LOCALES]
    .map(([localeLC, locale]) => {
      if (locale === DEFAULT_LOCALE) return;
      const language = LANGUAGES_RAW[locale];
      const count = countsByLocale.get(localeLC) || null;
      return {
        locale,
        language,
        isActive: ACTIVE_LOCALES.has(localeLC),
        count,
      };
    })
    .filter(Boolean);
  res.json({ locales });
});

async function countFilesByLocale() {
  const counts = new Map();
  let strip = CONTENT_TRANSLATED_ROOT;
  if (!strip.endsWith(path.sep)) {
    strip += path.sep;
  }
  new fdir()
    .withErrors()
    .withBasePath()
    .filter((filePath) => {
      if (!/\.(md|html)$/.test(filePath)) {
        return false;
      }
      const locale = filePath.replace(strip, "").split(path.sep)[0];
      counts.set(locale, (counts.get(locale) || 0) + 1);
      return false;
    })
    .crawl(CONTENT_TRANSLATED_ROOT)
    .sync();
  return counts;
}

router.get("/differences", async (req, res) => {
  if (!CONTENT_TRANSLATED_ROOT) {
    return res.status(500).send("CONTENT_TRANSLATED_ROOT not set");
  }
  const locale = (req.query.locale as string)?.toLowerCase();
  if (!locale) {
    return res.status(400).send("'locale' is always required");
  }
  if (!isValidLocale(locale)) {
    return res.status(400).send(`'${locale}' not a valid locale`);
  }
  if (locale === DEFAULT_LOCALE.toLowerCase()) {
    return res.status(400).send(`'${locale}' is the default locale`);
  }

  const label = `Find all translated documents (${locale})`;
  console.time(label);
  const found = await findDocuments({ locale });
  console.timeEnd(label);
  res.json(found);
});

router.get("/missing", async (req, res) => {
  if (!CONTENT_TRANSLATED_ROOT) {
    return res.status(500).send("CONTENT_TRANSLATED_ROOT not set");
  }
  const locale = (req.query.locale as string)?.toLowerCase();
  if (!locale) {
    return res.status(400).send("'locale' is always required");
  }
  if (!isValidLocale(locale)) {
    return res.status(400).send(`'${locale}' not a valid locale`);
  }
  if (locale === DEFAULT_LOCALE.toLowerCase()) {
    return res.status(400).send(`'${locale}' is the default locale`);
  }

  const label = `Find all missing translations (${locale})`;
  console.time(label);
  const found = await gatherL10NstatsSection({ locale });
  console.timeEnd(label);
  res.json(found);
});

router.get("/dashboard", async (req, res) => {
  if (!CONTENT_TRANSLATED_ROOT) {
    return res.status(500).send("CONTENT_TRANSLATED_ROOT not set");
  }
  const locale = String(req.query.locale || "").toLowerCase();
  const section = String(req.query.section || "/");
  if (!locale) {
    return res.status(400).send("'locale' is always required");
  }
  if (!isValidLocale(locale)) {
    return res.status(400).send(`'${locale}' not a valid locale`);
  }
  if (locale === DEFAULT_LOCALE.toLowerCase()) {
    return res.status(400).send(`'${locale}' is the default locale`);
  }

  const label = `Gather stat for ${locale} and section ${section}`;
  console.time(label);
  const data = await buildL10nDashboard({ locale, section });
  console.timeEnd(label);
  res.json(data);
});
