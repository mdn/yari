const fs = require("fs");

const {
  getPopularities,
  VALID_LOCALES,
  Document,
  Translation,
  CONTENT_TRANSLATED_ROOT,
} = require("../content");
const { getLastCommitURL } = require("../build");
const { ACTIVE_LOCALES, DEFAULT_LOCALE } = require("../libs/constants");
const LANGUAGES_RAW = require("../content/languages.json");

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

function packageEdits(document, parentDocument) {
  const commitURL = getLastCommitURL(
    document.fileInfo.root,
    document.metadata.hash
  );
  const parentCommitURL = getLastCommitURL(
    parentDocument.fileInfo.root,
    parentDocument.metadata.hash
  );
  const modified = document.metadata.modified;
  const parentModified = parentDocument.metadata.modified;
  return {
    commitURL,
    parentCommitURL,
    modified,
    parentModified,
  };
}

function packagePopularity(document, parentDocument) {
  return {
    value: document.metadata.popularity,
    ranking: document.metadata.popularity
      ? 1 +
        getAllPopularityValues().filter((p) => p > document.metadata.popularity)
          .length
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

// We can't just open the `index.json` and return it like that in the XHR
// payload. It's too much stuff and some values need to be repackaged/
// serialized or some other transformation computation.
function packageDocument(document, englishDocument, translationDifferences) {
  const mdn_url = document.url;
  const { title } = document.metadata;
  const popularity = packagePopularity(document, englishDocument);
  const differences = packageTranslationDifferences(translationDifferences);
  const edits = packageEdits(document, englishDocument);
  return { popularity, differences, edits, mdn_url, title };
}

const _foundDocumentsCache = new Map();
function findDocuments({ locale }) {
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
  const documentsFound = Document.findAll({
    locales: new Map([[locale, true]]),
  });
  counts.total = documentsFound.count;

  if (!_foundDocumentsCache.has(locale)) {
    _foundDocumentsCache.set(locale, new Map());
  }
  const cache = _foundDocumentsCache.get(locale);

  for (const filePath of documentsFound.iter({ pathOnly: true })) {
    const mtime = fs.statSync(filePath).mtime;

    if (!cache.has(filePath) || cache.get(filePath).mtime < mtime) {
      counts.cacheMisses++;
      const document = getDocument(filePath);
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

  return {
    counts,
    times,
    documents,
  };
}

function getDocument(filePath) {
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
  return packageDocument(document, englishDocument, differences);
}

function translationsRoute(req, res) {
  if (!CONTENT_TRANSLATED_ROOT) {
    return res.status(500).send("CONTENT_TRANSLATED_ROOT not set");
  }
  const locale = req.query.locale && req.query.locale.toLowerCase();
  if (!locale) {
    return res.status(400).send("'locale' is always required");
  }
  if (!VALID_LOCALES.has(locale)) {
    return res.status(400).send(`'${locale}' not a valid locale`);
  }
  if (locale === DEFAULT_LOCALE.toLowerCase()) {
    const locales = [...VALID_LOCALES]
      .map(([localeLC, locale]) => {
        if (locale === DEFAULT_LOCALE) return;
        const language = LANGUAGES_RAW[locale];
        return {
          locale,
          language,
          isActive: ACTIVE_LOCALES.has(localeLC),
        };
      })
      .filter(Boolean);
    return res.json({ locales });
  }

  const label = `Find all translated documents (${locale})`;
  console.time(label);
  const found = findDocuments({ locale });
  console.timeEnd(label);
  // console.log(found.documents[0]);
  res.json(found);
}

module.exports = { translationsRoute, findDocuments };
