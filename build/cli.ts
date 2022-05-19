// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'fs'.
const fs = require("fs");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'path'.
const path = require("path");
const zlib = require("zlib");

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'chalk'.
const chalk = require("chalk");
const cliProgress = require("cli-progress");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'program'.
const program = require("@caporal/core").default;
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'prompt'.
const { prompt } = require("inquirer");

const {
  // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'Document'.
  Document,
  // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'slugToFold... Remove this comment to see the full error message
  slugToFolder,
  // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'translatio... Remove this comment to see the full error message
  translationsOf,
  // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'CONTENT_RO... Remove this comment to see the full error message
  CONTENT_ROOT,
  // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'CONTENT_TR... Remove this comment to see the full error message
  CONTENT_TRANSLATED_ROOT,
} = require("../content");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'VALID_LOCA... Remove this comment to see the full error message
const { VALID_LOCALES } = require("../libs/constants");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'renderHTML... Remove this comment to see the full error message
// eslint-disable-next-line node/no-missing-require
const { renderHTML } = require("../ssr/dist/main");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'options'.
const options = require("./build-options");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'buildDocum... Remove this comment to see the full error message
const { buildDocument, renderContributorsTxt } = require("./index");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'SearchInde... Remove this comment to see the full error message
const SearchIndex = require("./search-index");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'BUILD_OUT_... Remove this comment to see the full error message
const { BUILD_OUT_ROOT } = require("./constants");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'makeSitema... Remove this comment to see the full error message
const { makeSitemapXML, makeSitemapIndexXML } = require("./sitemaps");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'humanFileS... Remove this comment to see the full error message
const { humanFileSize } = require("./utils");

async function buildDocumentInteractive(
  documentPath,
  interactive,
  invalidate = false
) {
  try {
    const document = invalidate
      ? // @ts-expect-error ts-migrate(2339) FIXME: Property 'read' does not exist on type '{ new (): ... Remove this comment to see the full error message
        Document.read(documentPath, Document.MEMOIZE_INVALIDATE)
      : // @ts-expect-error ts-migrate(2339) FIXME: Property 'read' does not exist on type '{ new (): ... Remove this comment to see the full error message
        Document.read(documentPath);

    if (!document) {
      throw new Error(`${documentPath} could not be read`);
    }

    if (!interactive) {
      const translations = translationsOf(document.metadata);
      if (translations && translations.length > 0) {
        document.translations = translations;
      } else {
        document.translations = [];
      }
    }

    return { document, doc: await buildDocument(document), skip: false };
  } catch (e) {
    if (!interactive) {
      throw e;
    }
    console.error(e);
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'action' does not exist on type 'String'.
    const { action } = await prompt([
      {
        type: "list",
        message: "What to do?",
        name: "action",
        choices: [
          { name: "re-run", value: "r" },
          { name: "skip", value: "s" },
          { name: "quit", value: "q" },
        ],
        default: "r",
      },
    ]);
    if (action === "r") {
      return await buildDocumentInteractive(documentPath, interactive, true);
    }
    if (action === "s") {
      return { doc: {}, skip: true };
    }
    throw e;
  }
}

async function buildDocuments(
  files = null,
  quiet = false,
  interactive = false,
  noHTML = false,
  locales = new Map()
) {
  // If a list of files was set, it came from the CLI.
  // Override whatever was in the build options.
  const findAllOptions = Object.assign({}, options, { locales });
  if (files) {
    // @ts-expect-error ts-migrate(2540) FIXME: Cannot assign to 'files' because it is a read-only... Remove this comment to see the full error message
    findAllOptions.files = new Set(files);
  }

  // @ts-expect-error ts-migrate(2339) FIXME: Property 'findAll' does not exist on type '{ new (... Remove this comment to see the full error message
  const documents = Document.findAll(findAllOptions);
  const progressBar = new cliProgress.SingleBar(
    {},
    cliProgress.Presets.shades_grey
  );

  const docPerLocale = {};
  const searchIndex = new SearchIndex();

  if (!documents.count) {
    throw new Error("No documents to build found");
  }

  let peakHeapBytes = 0;

  // For keeping track of the total counts of flaws
  const totalFlaws = new Map();

  function appendTotalFlaws(flaws) {
    for (const [key, actualFlaws] of Object.entries(flaws)) {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'length' does not exist on type 'unknown'... Remove this comment to see the full error message
      const count = actualFlaws.length;
      if (!totalFlaws.has(key)) {
        totalFlaws.set(key, 0);
      }
      totalFlaws.set(key, totalFlaws.get(key) + count);
    }
  }

  if (!options.noProgressbar) {
    progressBar.start(documents.count);
  }

  for (const documentPath of documents.iter({ pathOnly: true })) {
    const {
      doc: { doc: builtDocument, liveSamples, fileAttachments, bcdData },
      document,
      skip,
    } = await buildDocumentInteractive(documentPath, interactive);
    if (skip) {
      continue;
    }

    const outPath = path.join(BUILD_OUT_ROOT, slugToFolder(document.url));
    fs.mkdirSync(outPath, { recursive: true });

    if (builtDocument.flaws) {
      appendTotalFlaws(builtDocument.flaws);
    }

    if (!noHTML) {
      fs.writeFileSync(
        path.join(outPath, "index.html"),
        renderHTML(document.url, { doc: builtDocument })
      );
    }

    fs.writeFileSync(
      path.join(outPath, "index.json"),
      // This is exploiting the fact that renderHTML has the side-effect of
      // mutating the built document which makes this not great and refactor-worthy.
      JSON.stringify({ doc: builtDocument })
    );
    fs.writeFileSync(
      path.join(outPath, "contributors.txt"),
      renderContributorsTxt(
        document.metadata.contributors,
        builtDocument.source.github_url.replace("/blob/", "/commits/")
      )
    );
    for (const { url, data } of bcdData) {
      fs.writeFileSync(
        path.join(outPath, path.basename(url)),
        JSON.stringify(data, (key, value) => {
          // The BCD data object contains a bunch of data we don't need in the
          // React component that loads the `bcd.json` file and displays it.
          // The `.releases` block contains information about browsers (e.g
          // release dates) and that part has already been extracted and put
          // next to each version number where appropriate.
          // Therefore, we strip out all "retired" releases.
          if (key === "releases") {
            // @ts-expect-error ts-migrate(2550) FIXME: Property 'fromEntries' does not exist on type 'Obj... Remove this comment to see the full error message
            return Object.fromEntries(
              // @ts-expect-error ts-migrate(2339) FIXME: Property 'status' does not exist on type 'unknown'... Remove this comment to see the full error message
              Object.entries(value).filter(([, v]) => v.status !== "retired")
            );
          }
          return value;
        })
      );
    }

    for (const { id, html } of liveSamples) {
      const liveSamplePath = path.join(outPath, `_sample_.${id}.html`);
      fs.writeFileSync(liveSamplePath, html);
    }

    for (const filePath of fileAttachments) {
      // We *could* use symlinks instead. But, there's no point :)
      // Yes, a symlink is less disk I/O but it's nominal.
      fs.copyFileSync(filePath, path.join(outPath, path.basename(filePath)));
    }

    // Collect active documents' slugs to be used in sitemap building and
    // search index building.
    if (!builtDocument.noIndexing) {
      const { locale, slug } = document.metadata;
      if (!docPerLocale[locale]) {
        docPerLocale[locale] = [];
      }
      docPerLocale[locale].push({
        slug,
        modified: document.metadata.modified,
      });

      searchIndex.add(document);
    }

    if (!options.noProgressbar) {
      progressBar.increment();
    } else if (!quiet) {
      console.log(outPath);
    }
    const heapBytes = process.memoryUsage().heapUsed;
    if (heapBytes > peakHeapBytes) {
      peakHeapBytes = heapBytes;
    }
  }

  if (!options.noProgressbar) {
    progressBar.stop();
  }

  const sitemapsBuilt = [];
  for (const [locale, docs] of Object.entries(docPerLocale)) {
    const sitemapDir = path.join(
      BUILD_OUT_ROOT,
      "sitemaps",
      locale.toLowerCase()
    );
    fs.mkdirSync(sitemapDir, { recursive: true });
    const sitemapFilePath = path.join(sitemapDir, "sitemap.xml.gz");
    fs.writeFileSync(
      sitemapFilePath,
      zlib.gzipSync(makeSitemapXML(locale, docs))
    );
    sitemapsBuilt.push(sitemapFilePath);
  }

  // do we bother generating the combined sitemaps index file.
  // That means, that if you've done this at least once, consequent runs of
  if (CONTENT_TRANSLATED_ROOT) {
    const sitemapIndexFilePath = path.join(BUILD_OUT_ROOT, "sitemap.xml");
    fs.writeFileSync(
      sitemapIndexFilePath,
      makeSitemapIndexXML(
        sitemapsBuilt.map((fp) => fp.replace(BUILD_OUT_ROOT, ""))
      )
    );
  }

  searchIndex.sort();
  for (const [locale, items] of Object.entries(searchIndex.getItems())) {
    fs.writeFileSync(
      path.join(BUILD_OUT_ROOT, locale.toLowerCase(), "search-index.json"),
      JSON.stringify(items)
    );
  }
  return { slugPerLocale: docPerLocale, peakHeapBytes, totalFlaws };
}

function formatTotalFlaws(flawsCountMap, header = "Total_Flaws_Count") {
  if (!flawsCountMap.size) {
    return "";
  }
  const keys = [...flawsCountMap.keys()];
  const longestKey = Math.max(...keys.map((k) => k.length));
  const out = ["\n"];
  out.push(header);
  for (const key of keys.sort()) {
    out.push(
      `${key.padEnd(longestKey + 1)} ${flawsCountMap.get(key).toLocaleString()}`
    );
  }
  out.push("\n");
  return out.join("\n");
}

program
  .name("build")
  .option("-i, --interactive", "Ask what to do when encountering flaws", {
    default: false,
  })
  .option("-n, --nohtml", "Do not build index.html", {
    default: false,
  })
  .option("-l, --locale <locale...>", "Filtered specific locales", {
    default: [],
    validator: [...VALID_LOCALES.keys()],
  })
  .option("--not-locale <locale...>", "Exclude specific locales", {
    default: [],
    validator: [...VALID_LOCALES.keys()],
  })
  .argument("[files...]", "specific files to build")
  .action(async ({ args, options }) => {
    try {
      if (!options.quiet) {
        const roots = [
          ["CONTENT_ROOT", CONTENT_ROOT],
          ["CONTENT_TRANSLATED_ROOT", CONTENT_TRANSLATED_ROOT],
        ];
        for (const [key, value] of roots) {
          console.log(
            `${chalk.grey((key + ":").padEnd(25, " "))}${
              value ? chalk.white(value) : chalk.grey("not set")
            }`
          );
        }
      }
      const { files } = args;

      let locales = new Map();
      if (options.notLocale && options.notLocale.length > 0) {
        if (options.locale && options.locale.length) {
          throw new Error(
            "Can't use --not-locale and --locale at the same time"
          );
        }
        const notLocales = Array.isArray(options.notLocale)
          ? options.notLocale
          : [options.notLocale];

        locales = new Map(
          [...VALID_LOCALES.keys()]
            .filter((locale) => !notLocales.includes(locale))
            .map((locale) => [locale, true])
        );
      } else {
        // 'true' means we include this locale and all others get excluded.
        // Some day we might make it an option to set `--not-locale` to
        // filter out specific locales.
        locales = new Map(
          // The `options.locale` is either an empty array (e.g. no --locale used),
          // a string (e.g. one single --locale) or an array of strings
          // (e.g. multiple --locale options).
          (Array.isArray(options.locale)
            ? options.locale
            : [options.locale]
          ).map((locale) => [locale, true])
        );
      }

      const t0 = new Date();
      const { slugPerLocale, peakHeapBytes, totalFlaws } = await buildDocuments(
        files,
        Boolean(options.quiet),
        Boolean(options.interactive),
        Boolean(options.nohtml),
        locales
      );
      const t1 = new Date();
      const count = Object.values(slugPerLocale).reduce(
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'length' does not exist on type 'unknown'... Remove this comment to see the full error message
        (a, b) => a + b.length,
        0
      );
      // @ts-expect-error ts-migrate(2362) FIXME: The left-hand side of an arithmetic operation must... Remove this comment to see the full error message
      const seconds = (t1 - t0) / 1000;
      const took =
        seconds > 60
          ? `${(seconds / 60).toFixed(1)} minutes`
          : `${seconds.toFixed(1)} seconds`;
      if (!options.quiet) {
        console.log(
          chalk.green(
            `Built ${count.toLocaleString()} pages in ${took}, at a rate of ${
              // @ts-expect-error ts-migrate(2362) FIXME: The left-hand side of an arithmetic operation must... Remove this comment to see the full error message
              (count / seconds).toFixed(1)
            } documents per second.`
          )
        );
        if (locales.size) {
          console.log(
            chalk.yellow(
              `(only building locales: ${[...locales.keys()].join(", ")})`
            )
          );
        }
        console.log(`Peak heap memory usage: ${humanFileSize(peakHeapBytes)}`);
        console.log(formatTotalFlaws(totalFlaws));
      }
    } catch (error) {
      // So you get a stacktrace in the CLI output
      console.error(error);
      // So that the CLI ultimately fails
      throw error;
    }
  });

program.run();
