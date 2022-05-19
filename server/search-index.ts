// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'fs'.
const fs = require("fs");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'path'.
const path = require("path");

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'fdir'.
const { fdir } = require("fdir");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'fm'.
const fm = require("front-matter");

const {
  // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'CONTENT_RO... Remove this comment to see the full error message
  CONTENT_ROOT,
  // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'CONTENT_TR... Remove this comment to see the full error message
  CONTENT_TRANSLATED_ROOT,
  // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'VALID_LOCA... Remove this comment to see the full error message
  VALID_LOCALES,
} = require("../content");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'SearchInde... Remove this comment to see the full error message
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

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'searchInde... Remove this comment to see the full error message
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
  res.json(searchIndex.getItems()[locale]);
}

module.exports = {
  searchIndexRoute,
};
