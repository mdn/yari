const fs = require("fs");
const path = require("path");

const { fdir } = require("fdir");
const fm = require("front-matter");

const {
  CONTENT_ROOT,
  CONTENT_TRANSLATED_ROOT,
  VALID_LOCALES,
} = require("../content");
const { SearchIndex } = require("../build");

function populateSearchIndex(searchIndex, localeLC) {
  const root = path.join(
    localeLC === "en-us" ? CONTENT_ROOT : CONTENT_TRANSLATED_ROOT,
    localeLC
  );
  const locale = VALID_LOCALES.get(localeLC);
  const api = new fdir().withFullPaths().withErrors().crawl(root);
  for (const filePath of api.sync()) {
    if (!(filePath.endsWith("index.html") || filePath.endsWith("index.md"))) {
      continue;
    }
    const rawContent = fs.readFileSync(filePath, "utf-8");
    const { attributes: metadata } = fm(rawContent);
    metadata.locale = locale;

    const url = `/${locale}/docs/${metadata.slug}`;
    const doc = { metadata, url };
    searchIndex.add(doc);
  }
}

// The reason it's somewhat short is if you're using Yari for content-writing,
// and not doing local dev of Yari itself, then you might have changed
// something in the content (e.g. checked out a different branch) which
// wouldn't restart the Node Express server.
// But having a module-level in-memory cache makes the autocomplete search,
// massively much faster which is helpful when working on the autocomplete
// search functionality itself, or you're just using it for your
// localhost:5000 preview server and you search often in new/differen tabs.
const SEARCH_INDEX_CACHE_TIMEOUT = 5 * 60 * 1000;
const searchIndexItemsCache = new Map();

async function searchIndexRoute(req, res) {
  // Remember, this is always in lowercase because of a middleware
  // that lowercases all incoming requests' pathname.
  const locale = req.params.locale;
  if (locale !== "en-us" && !CONTENT_TRANSLATED_ROOT) {
    res.status(500).send("CONTENT_TRANSLATE_ROOT not set\n");
    return;
  }
  if (!VALID_LOCALES.has(locale)) {
    res.status(500).send(`unrecognized locale ${locale}`);
    return;
  }

  // Exit early using the module-level cache possibly.
  const cached = searchIndexItemsCache.get(locale);
  if (cached) {
    const label = `Using temporarily cached search-index: ${locale}`;
    console.time(label);
    const age = new Date().getTime() - cached[0].getTime();
    if (age < SEARCH_INDEX_CACHE_TIMEOUT && cached[1].length) {
      res.json(cached[1]);
      console.timeEnd(label);
      return;
    }
  }

  // The advantage of creating the search index over and over on every
  // request is that it can't possible cache itself stale.
  // Imagine if a user just seconds ago created a page, and reaches for
  // the search widget and can't find what they just created.
  // Or perhaps they edited a title and expect that to turn up.

  // However, if this is causing a problem, we can easily turn on some
  // caching. Either `Cache-Control` on the response.
  // Or, we can make this `searchIndex` a module global so it's reused
  // repeatedly until the server is restarted.

  const searchIndex = new SearchIndex();

  const label = "Populate search-index";
  console.time(label);
  populateSearchIndex(searchIndex, locale);
  searchIndex.sort();
  console.timeEnd(label);
  const items = searchIndex.getItems()[locale];
  res.json(items);
  searchIndexItemsCache.set(locale, [new Date(), items]);
}

module.exports = {
  searchIndexRoute,
};
