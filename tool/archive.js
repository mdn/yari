/**
 * This script turns a list of slugs, finds all their documents and sub-documents
 * and copies them into the equivalent $CONTENT_ARCHIVED_ROOT repo.
 * It also creates and sets up redirects for you.
 */

const cheerio = require("cheerio");
const chalk = require("chalk");

const { CONTENT_ARCHIVED_ROOT, Document } = require("../content");
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
      const folderPath = Document.archive(
        renderedHtml,
        document.rawBody,
        document.metadata,
        document.isMarkdown,
        CONTENT_ARCHIVED_ROOT
      );

      let removed = null;
      if (options.remove) {
        removed = Document.remove(
          document.metadata.slug,
          document.metadata.locale,
          {
            recursive: false,
            redirect: options.redirectToGithub
              ? getGitHubArchivedRedirectURL(folderPath)
              : "",
          }
        );
      }
      archived.push({ folderPath, document, removed });
    }
  }

  return archived;
}

function getGitHubArchivedRedirectURL(folderPath) {
  return `https://github.com/mdn/archived-content/tree/main/files/${folderPath}`;
}

module.exports = { runArchive };
