const fs = require("fs");
const path = require("path");
const util = require("util");

const fm = require("front-matter");

const {
  CONTENT_ROOT,
  CONTENT_TRANSLATED_ROOT,
  VALID_LOCALES,
} = require("./content");
const { SearchIndex } = require("./build");

const promisifed = util.promisify(fs.readFile);

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

const searchIndex = new SearchIndex();

(async () => {
  const label = "Populate search-index";
  console.time(label);
  await populateSearchIndex(searchIndex, "en-us");
  searchIndex.sort();
  console.timeEnd(label);
  console.log(searchIndex.getItems()["en-us"].length);
})();
