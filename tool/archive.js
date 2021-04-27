/**
 * This script turns a list of slugs, finds all their documents and sub-documents
 * and copies them into the equivalent $CONTENT_ARCHIVED_ROOT repo.
 * It also creates and sets up redirects for you.
 */

const path = require("path");

const cheerio = require("cheerio");
const chalk = require("chalk");

const { CONTENT_ARCHIVED_ROOT, Document, Redirect } = require("../content");
const kumascript = require("../kumascript");

async function runArchive(slugs, options) {
  // The record of all the things we archived
  const archived = [];

  // check that one is not a child of another
  for (const x of slugs) {
    for (const y of slugs) {
      if (x !== y && x.toLowerCase().startsWith(y.toLowerCase())) {
        throw new Error(`${x} appears to be a child of ${y}`);
      }
    }
  }

  // Sanity check because if it's not set the Document.archive() function
  // will attempt to guess.
  if (!CONTENT_ARCHIVED_ROOT) {
    throw new Error("CONTENT_ARCHIVED_ROOT is not set");
  }

  const removes = new Map();

  for (const slug of slugs) {
    const folderSearch = `/${slug.toLowerCase()}`;
    const search = Document.findAll({
      folderSearch,
    });
    if (!search.count) {
      throw new Error(`Nothing found searching for ${folderSearch}`);
    }
    console.log(
      `Found ${chalk.bold(search.count)} documents under ${chalk.bold(
        folderSearch
      )}`
    );

    const iter = search.iter();
    for (const document of iter) {
      if (document.isArchive) {
        continue;
      }
      const [renderedHtmlWhole] = await kumascript.render(document.url);
      const $ = cheerio.load(renderedHtmlWhole);
      if (!$("body").length === 1) {
        throw new Error(
          "Expected the kumascript.render() to return HTML wrapped in <html><body>"
        );
      }
      const renderedHtml = $("body").html().trim() + "\n";
      // console.log(document.fileInfo);
      // console.log("document.fileInfo.root==", document.fileInfo.root);
      const folderPath = Document.archive(
        renderedHtml,
        document.rawBody,
        document.metadata,
        document.isMarkdown,
        CONTENT_ARCHIVED_ROOT,
        path.dirname(document.fileInfo.path)
      );

      if (options.remove) {
        if (!removes.has(slug)) {
          removes.set(slug, []);
        }
        removes.get(slug).push(document);
      }
      archived.push({ folderPath, document });
    }

    if (removes.size) {
      const redirectPairs = new Map();
      const removeLocales = new Map();
      for (const [slug, documents] of removes) {
        if (!removeLocales.has(slug)) {
          removeLocales.set(slug, new Set());
        }

        for (const document of documents) {
          const { locale } = document.metadata;
          removeLocales.get(slug).add(locale);
          if (!redirectPairs.has(locale)) {
            redirectPairs.set(locale, []);
          }
          redirectPairs
            .get(locale)
            .push([
              document.url,
              getGitHubArchivedRedirectURL(document.fileInfo.folder),
            ]);
        }
      }
      for (const [slug, locales] of removeLocales) {
        for (const locale of locales) {
          console.log("REMOVE...:", { slug, locale });
          Document.remove(slug, locale, {
            recursive: true,
            redirect: "",
          });
        }
      }

      for (const [locale, pairs] of redirectPairs) {
        // Only bother for en-US because otherwise it might get confused with
        // the content still existing in the translated-content.
        if (locale === "en-US") {
          Redirect.add(locale, pairs);
        }
      }
    }
  }

  return archived;
}

function getGitHubArchivedRedirectURL(folderPath) {
  return `https://github.com/mdn/archived-content/tree/main/files/${folderPath}`;
}

module.exports = { runArchive };
