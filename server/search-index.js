const fs = require("graceful-fs");
const path = require("path");
const util = require("util");

const fm = require("front-matter");

const {
  CONTENT_ROOT,
  CONTENT_TRANSLATED_ROOT,
  VALID_LOCALES,
} = require("../content");
const { SearchIndex } = require("../build");

const promisifed = util.promisify(fs.readFile);

function* walker(root) {
  const files = fs.readdirSync(root);
  for (const name of files) {
    const filepath = path.join(root, name);
    const isDirectory = fs.statSync(filepath).isDirectory();
    if (isDirectory) {
      yield* walker(filepath);
    } else {
      yield filepath;
    }
  }
}

async function populateSearchIndex(searchIndex, localeLC) {
  const root = path.join(
    localeLC === "en-us" ? CONTENT_ROOT : CONTENT_TRANSLATED_ROOT,
    localeLC
  );
  const filePaths = [...walker(root)].filter((filePath) => {
    const basename = path.basename(filePath);
    return basename === "index.html" || basename === "index.md";
  });
  const locale = VALID_LOCALES.get(localeLC);
  await Promise.all(
    filePaths.map(async (filePath) => {
      const rawContent = await promisifed(filePath, "utf-8");
      const { attributes: metadata } = fm(rawContent);
      metadata.locale = locale;

      const url = `/${locale}/docs/${metadata.slug}`;
      const doc = { metadata, url };
      searchIndex.add(doc);
    })
  );
}

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
  await populateSearchIndex(searchIndex, locale);
  searchIndex.sort();
  console.timeEnd(label);
  res.json(searchIndex.getItems()[locale]);
}

module.exports = {
  searchIndexRoute,
};
