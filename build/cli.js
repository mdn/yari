const fs = require("fs");
const path = require("path");

const cliProgress = require("cli-progress");

const { CONTENT_ROOT, Document, slugToFolder } = require("../content");
const { renderHTML } = require("../ssr/dist/main");

const options = require("./build-options");
const { buildDocument } = require("./index");
const SearchIndex = require("./search-index");
const { BUILD_OUT_ROOT } = require("./constants");

function makeSitemapXML(locale, slugs) {
  const wikiHistory = JSON.parse(
    fs.readFileSync(
      path.join(CONTENT_ROOT, locale.toLowerCase(), "_wikihistory.json"),
      "utf-8"
    )
  );
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...slugs
      .filter((slug) => slug in wikiHistory)
      .map((slug) =>
        [
          "<url>",
          `<loc>https://developer.mozilla.org/${locale}/docs/${slug}</loc>`,
          `<lastmod>${wikiHistory[slug].modified}</lastmod>`,
          "</url>",
        ].join("")
      ),
    "</urlset>",
    "",
  ].join("\n");
}

async function buildDocuments() {
  const documents = Document.findAll(options);
  const progressBar = new cliProgress.SingleBar(
    {},
    cliProgress.Presets.shades_grey
  );

  const slugPerLocale = {};
  const searchIndex = new SearchIndex();

  if (!documents.count) {
    throw new Error("No documents to build found");
  }

  let peakHeapBytes = 0;

  // This builds up a mapping from en-US slugs to
  const translationsOf = new Map();

  !options.noProgressbar && progressBar.start(documents.count);
  for (const document of documents.iter()) {
    const outPath = path.join(BUILD_OUT_ROOT, slugToFolder(document.url));
    fs.mkdirSync(outPath, { recursive: true });

    const { translation_of } = document.metadata;

    // If it's a non-en-US document, it'll most likely have a `translation_of`.
    // If so, add it to the map so that when we build the en-US one, we can
    // get an index of the *other* translations available.
    if (translation_of) {
      if (!translationsOf.has(translation_of)) {
        translationsOf.set(translation_of, []);
      }
      translationsOf.set(translation_of, [
        ...translationsOf.get(translation_of),
        { slug: document.metadata.slug, locale: document.metadata.locale },
      ]);
      // This is a shortcoming. If this is a translated document, we don't have a
      // complete mapping of all other translations. So, the best we can do is
      // at least link to the English version.
      // In 2021, when we refactor localization entirely, this will need to change.
      // Perhaps, then, we'll do a complete scan through all content first to build
      // up the map before we process each one.
      document.translations = [];
    } else {
      document.translations = translationsOf.get(document.metadata.slug);
    }

    const [builtDocument, liveSamples, fileAttachments] = await buildDocument(
      document
    );

    fs.writeFileSync(
      path.join(outPath, "index.html"),
      renderHTML(builtDocument, document.url)
    );
    fs.writeFileSync(
      path.join(outPath, "index.json"),
      // This is exploiting the fact that renderHTML has the side-effect of mutating builtDocument
      // which makes this not great and refactor-worthy
      JSON.stringify({ doc: builtDocument })
    );

    for (const { id, html } of liveSamples) {
      const liveSamplePath = path.join(outPath, "_samples_", id, "index.html");
      fs.mkdirSync(path.dirname(liveSamplePath), { recursive: true });
      fs.writeFileSync(liveSamplePath, html);
    }

    for (const filePath of fileAttachments) {
      // We *could* use symlinks instead. But, there's no point :)
      // Yes, a symlink is less disk I/O but it's nominal.
      fs.copyFileSync(filePath, path.join(outPath, path.basename(filePath)));
    }

    // Collect non-archived documents' slugs to be used in sitemap building and
    // search index building
    if (!document.isArchive) {
      const { locale, slug } = document.metadata;
      if (!slugPerLocale[locale]) {
        slugPerLocale[locale] = [];
      }
      slugPerLocale[locale].push(slug);

      searchIndex.add(document);
    }

    if (!options.noProgressbar) {
      progressBar.increment();
    } else {
      console.log(outPath);
    }
    const heapBytes = process.memoryUsage().heapUsed;
    if (heapBytes > peakHeapBytes) {
      peakHeapBytes = heapBytes;
    }
  }

  !options.noProgressbar && progressBar.stop();

  for (const [locale, slugs] of Object.entries(slugPerLocale)) {
    const sitemapDir = path.join(
      BUILD_OUT_ROOT,
      "sitemaps",
      locale.toLowerCase()
    );
    fs.mkdirSync(sitemapDir, { recursive: true });
    fs.writeFileSync(
      path.join(sitemapDir, "sitemap.xml"),
      makeSitemapXML(locale, slugs)
    );
  }

  searchIndex.sort();
  for (const [locale, items] of Object.entries(searchIndex.getItems())) {
    fs.writeFileSync(
      path.join(BUILD_OUT_ROOT, locale.toLowerCase(), "search-index.json"),
      JSON.stringify(items)
    );
  }
  return { slugPerLocale, peakHeapBytes };
}

function humanFileSize(size) {
  if (size < 1024) return size + " B";
  let i = Math.floor(Math.log(size) / Math.log(1024));
  let num = size / Math.pow(1024, i);
  let round = Math.round(num);
  num = round < 10 ? num.toFixed(2) : round < 100 ? num.toFixed(1) : round;
  return `${num} ${"KMGTPEZY"[i - 1]}B`;
}

if (require.main === module) {
  const t0 = new Date();
  buildDocuments()
    .then(({ slugPerLocale, peakHeapBytes }) => {
      const t1 = new Date();
      const count = Object.values(slugPerLocale).reduce(
        (a, b) => a + b.length,
        0
      );
      const seconds = (t1 - t0) / 1000;
      const took =
        seconds > 60
          ? `${(seconds / 60).toFixed(1)} minutes`
          : `${seconds.toFixed(1)} seconds`;
      console.log(
        `Built ${count.toLocaleString()} in ${took}, at a rate of ${(
          count / seconds
        ).toFixed(1)} documents per second.`
      );
      console.log(`Peak heap memory usage: ${humanFileSize(peakHeapBytes)}`);
    })
    .catch((error) => {
      console.error("error while building documents:", error);
      process.exit(1);
    });
}
