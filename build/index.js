const childProcess = require("child_process");

const chalk = require("chalk");

const PACKAGE_REPOSITORY_URL = require("../package.json").repository;
const { buildURL, Document } = require("../content");
const kumascript = require("../kumascript");

const { FLAW_LEVELS } = require("./constants");
const {
  extractSections,
  extractSidebar,
  extractTOC,
  extractSummary,
} = require("./document-extractor");
const SearchIndex = require("./search-index");
const { addBreadcrumbData } = require("./document-utils");
const { fixFixableFlaws, injectFlaws } = require("./flaws");
const { normalizeBCDURLs } = require("./bcd-urls");
const { checkImageReferences } = require("./check-images");
const { getPageTitle } = require("./page-title");
const { syntaxHighlight } = require("./syntax-highlight");
const cheerio = require("./monkeypatched-cheerio");
const buildOptions = require("./build-options");
const { renderCache: renderKumascriptCache } = require("../kumascript");

const DEFAULT_BRANCH_NAME = "main"; // That's what we use for github.com/mdn/content

// Module level global that gets set once and reused repeatedly
const currentGitBranch =
  (() => {
    if (process.env.CI_CURRENT_BRANCH) {
      return process.env.CI_CURRENT_BRANCH;
    } else {
      // If you're in detached head, (e.g. "d6a6c3f17") instead of a named
      // branch, this will fail. But that's why we rely on a default.
      const spawned = childProcess.spawnSync("git", [
        "branch",
        "--show-current",
      ]);
      if (spawned.error || spawned.status) {
        console.warn(
          "\nUnable to run 'git branch' to find out name of the current branch:\n",
          spawned.error ? spawned.error : spawned.stderr.toString().trim()
        );
      } else {
        return spawned.stdout.toString().trim();
      }
    }
  })() || DEFAULT_BRANCH_NAME;

/** Throw an error if the slug is insane.
 * This helps breaking the build if someone has put in faulty data into
 * the content (metadata file).
 * If all is well, do nothing. Nothing is expected to return.
 */
function validateSlug(slug) {
  if (!slug) {
    throw new Error("slug is empty");
  }
  if (slug.startsWith("/")) {
    throw new Error(`Slug '${slug}' starts with a /`);
  }
  if (slug.endsWith("/")) {
    throw new Error(`Slug '${slug}' ends with a /`);
  }
  if (slug.includes("//")) {
    throw new Error(`Slug '${slug}' contains a double /`);
  }
}

/**
 * Find all tags that we need to change to tell tools like Google Translate
 * to not translate.
 *
 * @param {Cheerio document instance} $
 */
function injectNoTranslate($) {
  $("pre").addClass("notranslate");
}

/**
 * Return the full URL directly to the file in GitHub based on this folder.
 * @param {String} folder - the current folder we're processing.
 */
function getGitHubURL(folder) {
  return `${PACKAGE_REPOSITORY_URL}/blob/${currentGitBranch}/content/files/${folder}/index.html`;
}

function injectSource(doc, folder) {
  doc.source = {
    folder,
    github_url: getGitHubURL(folder),
  };
}

async function buildDocument(document, documentOptions = {}) {
  // Important that the "local" document options comes last.
  // And use Object.assign to create a new object instead of mutating the
  // global one.
  const options = Object.assign({}, buildOptions, documentOptions);
  const { metadata, fileInfo } = document;
  console.log(metadata);
  console.log(fileInfo);

  const doc = {
    isArchive: document.isArchive,
    isTranslated: document.isTranslated,
  };

  doc.flaws = {};

  let renderedHtml = "";
  let flaws = [];
  const liveSamples = [];

  if (doc.isArchive) {
    renderedHtml = document.rawHTML;
  } else {
    if (options.clearKumascriptRenderCache) {
      renderKumascriptCache.clear();
    }
    [renderedHtml, flaws] = await kumascript.render(document.url);

    const sampleIds = kumascript.getLiveSampleIDs(
      document.metadata.slug,
      document.rawHTML
    );
    for (const sampleIdObject of sampleIds) {
      const liveSamplePage = kumascript.buildLiveSamplePage(
        document.url,
        document.metadata.title,
        renderedHtml,
        sampleIdObject
      );
      if (liveSamplePage.flaw) {
        flaws.push(liveSamplePage.flaw.updateFileInfo(fileInfo));
        continue;
      }
      liveSamples.push({
        id: sampleIdObject.id.toLowerCase(),
        html: liveSamplePage.html,
      });
    }

    if (flaws.length) {
      if (options.flawLevels.get("macros") === FLAW_LEVELS.ERROR) {
        // Report and exit immediately on the first document with flaws.
        console.error(
          chalk.red.bold(
            `Flaws (${flaws.length}) within ${document.metadata.slug} while rendering macros:`
          )
        );
        flaws.forEach((flaw, i) => {
          console.error(chalk.bold.red(`${i + 1}: ${flaw.name}`));
          console.error(chalk.red(`${flaw}\n`));
        });
        // XXX This is probably the wrong way to bubble up.
        process.exit(1);
      } else if (options.flawLevels.get("macros") === FLAW_LEVELS.WARN) {
        // doc.flaws.macros = flaws;
        // The 'flaws' array don't have everything we need from the
        // kumascript rendering, so we "beef it up" to have convenient
        // attributes needed.
        doc.flaws.macros = flaws.map((flaw, i) => {
          const fixable =
            flaw.name === "MacroRedirectedLinkError" &&
            (!flaw.filepath || flaw.filepath === document.fileInfo.path);
          const suggestion = fixable
            ? flaw.macroSource.replace(
                flaw.redirectInfo.current,
                flaw.redirectInfo.suggested
              )
            : null;
          const id = `macro_flaw${i}`;
          return Object.assign({ id, fixable, suggestion }, flaw);
        });
      }
    }
  }

  // TODO: The slug should always match the folder name.
  // If you edit the slug bug don't correctly edit the folder it's in
  // it's going to lead to confusion.
  // We can use the utils.slugToFolder() function and compare
  // its output with the `folder`.
  validateSlug(metadata.slug);

  const $ = cheerio.load(`<div id="_body">${renderedHtml}</div>`);

  // Remove those '<span class="alllinks"><a href="/en-US/docs/tag/Web">View All...</a></span>' links.
  // If a document has them, they don't make sense in a Yari world anyway.
  $("span.alllinks").remove();

  doc.title = metadata.title;
  doc.mdn_url = document.url;
  if (metadata.translation_of) {
    doc.translation_of = metadata.translation_of;
  }

  // Note that 'extractSidebar' will always return a string.
  // And if it finds a sidebar section, it gets removed from '$' too.
  // Also note, these operations mutate the `$`.
  doc.sidebarHTML = extractSidebar($);

  // Extract all the <h2> tags as they appear into an array.
  doc.toc = extractTOC($);

  // Check and scrutinize any local image references
  const fileAttachments = checkImageReferences(doc, $, options, document);

  // With the sidebar out of the way, go ahead and check the rest
  injectFlaws(doc, $, options, document);

  // If fixFlaws is on and the doc has fixable flaws, this returned
  // raw HTML string will be different.
  try {
    await fixFixableFlaws(doc, options, document);
  } catch (error) {
    console.error(error);
    throw error;
  }

  // Apply syntax highlighting all <pre> tags.
  syntaxHighlight($, doc);

  // Post process HTML so that the right elements gets tagged so they
  // *don't* get translated by tools like Google Translate.
  injectNoTranslate($);

  // Turn the $ instance into an array of section blocks. Most of the
  // section blocks are of type "prose" and their value is a string blob
  // of HTML.
  doc.body = extractSections($);

  // The summary comes from the HTML and potentially the <h2>Summary</h2>
  // section. It's always a plain text string.
  doc.summary = extractSummary(doc.body);

  // Creates new mdn_url's for the browser-compatibility-table to link to
  // pages within this project rather than use the absolute URLs
  normalizeBCDURLs(doc, options);

  // If the document has a `.popularity` make sure don't bother with too
  // many significant figures on it.
  doc.popularity = metadata.popularity
    ? Number(metadata.popularity.toFixed(4))
    : 0.0;

  doc.modified = metadata.modified || null;

  const otherTranslations = document.translations || [];
  if (!otherTranslations.length && metadata.translation_of) {
    // But perhaps the parent has other translations?!
    const parentURL = buildURL("en-US", metadata.translation_of);
    const parentDocument = Document.findByURL(parentURL);
    // See note in 'ensureAllTitles()' about why we need this if statement.
    if (parentDocument) {
      const parentOtherTranslations = parentDocument.metadata.translations;
      if (parentOtherTranslations && parentOtherTranslations.length) {
        otherTranslations.push(
          ...parentOtherTranslations.filter(
            (translation) => translation.locale !== metadata.locale
          )
        );
      }
    }
  }
  if (otherTranslations.length) {
    doc.other_translations = otherTranslations;
  }

  injectSource(doc, document.fileInfo.folder);

  // The `titles` object should contain every possible URI->Title mapping.
  // We can use that generate the necessary information needed to build
  // a breadcrumb in the React component.
  addBreadcrumbData(document.url, doc);

  doc.pageTitle = getPageTitle(doc);

  return [doc, liveSamples, fileAttachments];
}

async function buildDocumentFromURL(url, documentOptions = {}) {
  const document = Document.findByURL(url);
  if (!document) {
    return null;
  }
  return (await buildDocument(document, documentOptions))[0];
}

async function buildLiveSamplePageFromURL(url) {
  const [documentURL, sampleID] = url.split("/_samples_/");
  const document = Document.findByURL(documentURL);
  if (!document) {
    throw new Error(`No document found for ${documentURL}`);
  }
  // Convert the lower-case sampleID we extract from the incoming URL into
  // the actual sampleID object with the properly-cased live-sample ID.
  for (const sampleIDObject of kumascript.getLiveSampleIDs(
    document.metadata.slug,
    document.rawHTML
  )) {
    if (sampleIDObject.id.toLowerCase() === sampleID) {
      const liveSamplePage = kumascript.buildLiveSamplePage(
        document.url,
        document.metadata.title,
        (await kumascript.render(document.url))[0],
        sampleIDObject
      );
      if (liveSamplePage.flaw) {
        throw new Error(liveSamplePage.flaw.toString());
      }
      return liveSamplePage.html;
    }
  }
  throw new Error(`No live-sample "${sampleID}" found within ${documentURL}`);
}

module.exports = {
  FLAW_LEVELS,

  buildDocument,

  buildDocumentFromURL,
  buildLiveSamplePageFromURL,

  SearchIndex,

  options: buildOptions,
};
