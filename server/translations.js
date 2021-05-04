const LRU = require("lru-cache");

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

// Hacky memoize exclusively for local development
const MEMOIZE_INVALIDATE = Symbol("force cache update");
function isPromise(p) {
  return p && Object.prototype.toString.call(p) === "[object Promise]";
}

function memoize(fn) {
  // if (process.env.NODE_ENV !== "production") {
  //   return fn;
  // }

  const cache = new LRU({ max: 2000 });
  return (...args) => {
    let invalidate = false;
    if (args.includes(MEMOIZE_INVALIDATE)) {
      args.splice(args.indexOf(MEMOIZE_INVALIDATE), 1);
      invalidate = true;
    }
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      if (invalidate) {
        cache.del(key);
      } else {
        return cache.get(key);
      }
    }

    const value = fn(...args);
    if (isPromise(value)) {
      return value.then((actualValue) => {
        cache.set(key, actualValue);
        return actualValue;
      });
    }
    cache.set(key, value);
    return value;
  };
}

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

function validPopularityFilter(value) {
  let filter = null;
  if (value) {
    if (/[^\d<>]/.test(value.replace(/\s+/g, ""))) {
      return [null, "popularity contains unrecognized characters"];
    }
    if (value.startsWith("<")) {
      filter = { min: parseInt(value.slice(1).trim()) };
    } else if (value.startsWith(">")) {
      filter = { max: parseInt(value.slice(1).trim()) };
    } else {
      throw new Error("Not implemented");
    }
  }
  return [filter, null];
}

function packageTranslationDifferences(translationDifferences) {
  const count = translationDifferences.length;
  let total = 0;
  translationDifferences.forEach((difference) => {
    if (
      difference.explanationNotes &&
      Array.isArray(difference.explanationNotes)
    ) {
      total += difference.explanationNotes.length;
    } else {
      total++;
    }
  });
  return { count, total };
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

// We can't just open the `index.json` and return it like that in the XHR
// payload. It's too much stuff and some values need to be repackaged/
// serialized or some other transformation computation.
function packageDocument(document, englishDocument, translationDifferences) {
  // const englishModified = englishDocument.metadata.modified;
  const mdn_url = document.url;
  const { title } = document.metadata;
  const popularity = {
    value: document.metadata.popularity,
    ranking: document.metadata.popularity
      ? 1 +
        getAllPopularityValues().filter((p) => p > document.metadata.popularity)
          .length
      : NaN,
  };
  const differences = packageTranslationDifferences(translationDifferences);
  const edits = packageEdits(document, englishDocument);
  return { popularity, differences, edits, mdn_url, title };
}

const findDocuments = memoize(
  ({ locale, filters, page, sortBy, sortReverse }) => {
    const DOCUMENTS_PER_PAGE = 25;

    const counts = {
      // Number of documents found with the matching filters.
      found: 0,
      // Number of documents encountered prior to filters.
      total: 0,
      // Used by the pagination
      pages: 0,
      // Translated documents that can't be linked to its English parent
      noParent: 0,
    };

    const documents = [];

    const t1Total = new Date();

    // let filteredFlaws = new Set();
    // if (filters.flaws) {
    //   if (Array.isArray(filters.flaws)) {
    //     filteredFlaws = new Set(filters.flaws);
    //   } else {
    //     filteredFlaws = new Set([filters.flaws]);
    //   }
    // }

    // let searchFlaws = new Map();
    // if (filters.search_flaws) {
    //   if (Array.isArray(filters.search_flaws)) {
    //     searchFlaws = new Map(filters.search_flaws.map((x) => x.split(":", 2)));
    //   } else {
    //     searchFlaws = new Map([filters.search_flaws].map((x) => x.split(":", 2)));
    //   }
    // }

    const t1ListDocuments = new Date();
    const documentsFound = Document.findAll({
      locales: new Map([[locale, true]]),
    });
    counts.total = documentsFound.count;
    const t2ListDocuments = new Date();
    const tookListDocuments =
      t2ListDocuments.getTime() - t1ListDocuments.getTime();

    for (const document of documentsFound.iter()) {
      if (
        (filters.mdn_url &&
          !document.url
            .toLowerCase()
            .includes(filters.mdn_url.toLowerCase())) ||
        (filters.title &&
          !document.metadata.title
            .toLowerCase()
            .includes(filters.title.toLowerCase()))
      ) {
        continue;
      }

      const { popularityFilter } = filters;
      if (popularityFilter) {
        const docRanking = document.metadata.popularity
          ? 1 +
            getAllPopularityValues().filter(
              (p) => p > document.metadata.popularity
            ).length
          : NaN;
        if (popularityFilter.min) {
          if (isNaN(docRanking) || docRanking > popularityFilter.min) {
            continue;
          }
        } else if (popularityFilter.max && docRanking < popularityFilter.max) {
          continue;
        }
      }

      const englishDocument = Document.read(
        document.fileInfo.folder.replace(
          document.metadata.locale.toLowerCase(),
          DEFAULT_LOCALE.toLowerCase()
        )
      );
      if (!englishDocument) {
        counts.noParent++;
        continue;
      }

      const differences = [];
      for (const difference of Translation.getTranslationDifferences(
        englishDocument,
        document
      )) {
        differences.push(difference);
      }
      const packaged = packageDocument(document, englishDocument, differences);

      counts.found++;
      documents.push(packaged);
    }

    counts.pages = Math.ceil(counts.found / DOCUMENTS_PER_PAGE);

    const sortMultiplier = sortReverse ? -1 : 1;
    documents.sort((a, b) => {
      switch (sortBy) {
        case "popularity":
          return (
            sortMultiplier *
            ((b.popularity.value || 0) - (a.popularity.value || 0))
          );
        case "flaws":
          return (
            sortMultiplier * (countFilteredFlaws(a) - countFilteredFlaws(b))
          );
        case "mdn_url":
          if (a.mdn_url.toLowerCase() < b.mdn_url.toLowerCase()) {
            return sortMultiplier * -1;
          } else if (a.mdn_url.toLowerCase() > b.mdn_url.toLowerCase()) {
            return sortMultiplier;
          }
          return 0;

        case "modified":
          return (
            sortMultiplier *
            (new Date(a.date.modified).getTime() -
              new Date(b.date.modified).getTime())
          );

        default:
          throw new Error("not implemented");
      }
    });

    const t2Total = new Date();
    const tookTotal = t2Total.getTime() - t1Total.getTime();

    const times = {
      tookTotal,
      tookListDocuments,
    };

    const [m, n] = [(page - 1) * DOCUMENTS_PER_PAGE, page * DOCUMENTS_PER_PAGE];

    return {
      counts,
      times,
      documents: documents.slice(m, n),
    };
  }
);

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
    // 451 is a bit of a joke. Thankfully this isn't important.
    return res.status(451).json({ locales });
  }

  const filters = req.query;

  let page;
  try {
    page = parseInt(req.query.page || "1");
    if (page < 1) {
      return res.status(400).send("'page' number too small");
    }
  } catch (err) {
    return res.status(400).send("'page' number invalid");
  }

  const [popularityFilter, popularityFilterError] = validPopularityFilter(
    filters.popularity
  );
  if (popularityFilterError) {
    return res.status(400).send(popularityFilterError.toString());
  }
  filters.popularityFilter = popularityFilter;

  const sortBy = req.query.sort || "popularity";
  const sortReverse = JSON.parse(req.query.reverse || "false");
  const found = findDocuments({
    locale,
    filters,
    page,
    sortBy,
    sortReverse,
  });
  console.log(found.documents[0]);
  res.json(found);
}

module.exports = { translationsRoute, findDocuments };
