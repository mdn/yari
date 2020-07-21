const childProcess = require("child_process");
const fs = require("fs");
const path = require("path");

const chalk = require("chalk");
const cliProgress = require("cli-progress");
const packageJSON = require("../package.json");

const { buildURL, Document, Redirect, slugToFoldername } = require("content");
const kumascript = require("kumascript");
const { renderHTML } = require("ssr");

const { FLAW_LEVELS } = require("./constants");
const {
  extractDocumentSections,
  extractSidebar,
} = require("./document-extractor");
const { addBreadcrumbData } = require("./document-utils");
const { injectFlaws } = require("./flaws");
const cheerio = require("./monkeypatched-cheerio");

const BUILD_OUT_ROOT = path.join(__dirname, "..", "client", "build");

function getCurrentGitHubBaseURL() {
  return packageJSON.repository;
}

// Module level global that gets set once and reused repeatedly
let _currentGitBranch = null;
function getCurrentGitBranch(fallback = "master") {
  if (!_currentGitBranch) {
    // XXX Fixme with what you'd get in the likes of TravisCI!
    if (process.env.CI_CURRENT_BRANCH) {
      _currentGitBranch = process.env.CI_CURRENT_BRANCH;
    } else {
      const spawned = childProcess.spawnSync("git", [
        "branch",
        "--show-current",
      ]);
      if (spawned.error || spawned.status) {
        console.warn(
          "\nUnable to run 'git branch' to find out name of the current branch:\n",
          spawned.error ? spawned.error : spawned.stderr.toString().trim()
        );
        // I don't think it makes sense to keep trying, so let's cache the fallback.
        _currentGitBranch = fallback;
      } else {
        _currentGitBranch = spawned.stdout.toString().trim();
      }
    }
  }
  return _currentGitBranch;
}

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
 * Recursive method that renders the macros within the document
 * represented by this source, URI, metadata and raw HTML, as
 * well as builds any live samples within this document or within
 * other documents referenced by this document.
 */
async function renderMacrosAndBuildLiveSamples(
  { rawHtml, metadata },
  url,
  { selectedSampleIDs = null } = {}
) {
  // First, render the macros to get the rendered HTML.
  const [renderedHtml, flaws] = await kumascript.render(
    buildURL(metadata.locale, metadata.slug)
  );

  // Next, let's find any samples that we need to build, and note
  // that one or more or even all might be within other documents.
  let ownSampleIds;
  let otherSampleIds = null;
  if (selectedSampleIDs) {
    ownSampleIds = selectedSampleIDs;
  } else {
    [ownSampleIds, otherSampleIds] = kumascript.getLiveSampleIDs(
      metadata.slug,
      rawHtml
    );
  }

  // Next, let's build the live sample pages from the current document, if any.
  if (ownSampleIds) {
    // Now, we'll either update or create new live sample pages.
    let liveSamplePageHTML;
    for (const sampleIDWithContext of ownSampleIds) {
      try {
        liveSamplePageHTML = kumascript.buildLiveSamplePage(
          url,
          metadata.title,
          renderedHtml,
          sampleIDWithContext
        );
      } catch (e) {
        if (e instanceof kumascript.LiveSampleError) {
          flaws.push(e);
        } else {
          throw e;
        }
      }
    }
  }

  // Finally, let's build any live sample pages within other documents.
  // This document may rely on live sample pages from other documents,
  // so if that's the case, we need to build the specific live sample
  // pages in each of the other documents that this document references.
  // Consider "/en-US/docs/learn/forms/how_to_build_custom_form_controls",
  // which references live sample pages from each of the following:
  // "/en-us/docs/learn/forms/how_to_build_custom_form_controls/example_1"
  // "/en-us/docs/learn/forms/how_to_build_custom_form_controls/example_2"
  // "/en-us/docs/learn/forms/how_to_build_custom_form_controls/example_3"
  // "/en-us/docs/learn/forms/how_to_build_custom_form_controls/example_4"
  // "/en-us/docs/learn/forms/how_to_build_custom_form_controls/example_5"
  for (const [slug, sampleIDs] of otherSampleIds || []) {
    const [{ context }] = sampleIDs;
    const otherURL = buildURL(metadata.locale, slug);
    const otherCleanUri = Redirect.resolve(otherURL);
    // TODO
    if (!"documentExists") {
      // I suppose we could use any, but let's use the context of the first
      // usage of the sampleID within the original source file.
      flaws.push(
        new kumascript.LiveSampleError(
          new Error(
            `${url} references live sample(s) from ${otherCleanUri}, which does not exist`
          ),
          context.source,
          context.token
        )
      );
      continue;
    }
    // TODO
    if (!"isFromTheSameSource") {
      // Again let's just use the context of the first usage of sampleID within
      // the original source file.
      flaws.push(
        new kumascript.LiveSampleError(
          new Error(
            `${url} references live sample(s) from ${otherCleanUri}, which is from a different source`
          ),
          context.source,
          context.token
        )
      );
      continue;
    }
    const otherDocument = Document.read(slugToFoldername(slug));
    if (!otherDocument) {
      continue;
    }
    const otherResult = await renderMacrosAndBuildLiveSamples(otherDocument, {
      selectedSampleIDs: sampleIDs,
    });
    const otherFlaws = otherResult[1];
    // Flatten the flaws from this other document into the current flaws,
    // and set the filepath for flaws that haven't already been set at
    // a different level of recursion.
    for (const flaw of otherFlaws) {
      if (!flaw.filepath) {
        flaw.filepath = otherDocument.fileInfo.path;
      }
      flaws.push(flaw);
    }
  }

  return [renderedHtml, flaws];
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
  const gitURL = getCurrentGitHubBaseURL();
  const branch = getCurrentGitBranch();
  return `${gitURL}/blob/${branch}/content/files/${folder}/index.html`;
}

function injectSource(doc, folder) {
  doc.source = {
    folder,
    github_url: getGitHubURL(folder),
  };
}

const options = { flawLevels: new Map() };

async function buildDocument(document) {
  const doc = {};

  doc.flaws = {};

  let [renderedHtml, flaws] = await renderMacrosAndBuildLiveSamples(document);

  const { rawHtml, metadata, fileInfo } = document;
  if (flaws.length) {
    // The flaw objects might have a 'line' attribute, but the
    // original document it came from had front-matter in the file.
    // The KS renderer doesn't know about this, so we adjust it
    // accordingly.
    // Only applicable if the flaw has a 'line'
    flaws.forEach((flaw) => {
      if (flaw.line) {
        // The extra `- 1` is because of the added newline that
        // is only present because of the serialized linebreak.
        flaw.line += fileInfo.frontMatterOffset - 1;
      }
    });

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
      // For each flaw, inject the path of the file that was used.
      // This gets used in the dev UI so that you can get a shortcut
      // link to open that file directly in your $EDITOR.
      for (const flaw of flaws) {
        if (!flaw.filepath) {
          flaw.filepath = fileInfo.path;
        }
      }
      doc.flaws.macros = flaws;
    }
  }

  // TODO: The slug should always match the folder name.
  // If you edit the slug bug don't correctly edit the folder it's in
  // it's going to lead to confusion.
  // We can use the utils.slugToFoldername() function and compare
  // its output with the `folder`.
  validateSlug(metadata.slug);

  const $ = cheerio.load(`<div id="_body">${renderedHtml}</div>`);

  // Remove those '<span class="alllinks"><a href="/en-US/docs/tag/Web">View All...</a></span>' links.
  // If a document has them, they don't make sense in a Yari world anyway.
  $("span.alllinks").remove();

  doc.title = metadata.title;
  doc.summary = metadata.summary;
  doc.mdn_url = document.url;
  if (metadata.translation_of) {
    doc.translation_of = metadata.translation_of;
  }

  // Note that 'extractSidebar' will always return a string.
  // And if it finds a sidebar section, it gets removed from '$' too.
  // Also note, these operations mutate the `$`.
  doc.sidebarHTML = extractSidebar($);

  // With the sidebar out of the way, go ahead and check the rest
  injectFlaws(doc, $);

  // Post process HTML so that the right elements gets tagged so they
  // *don't* get translated by tools like Google Translate.
  injectNoTranslate($);

  doc.body = extractDocumentSections($);

  doc.popularity = metadata.popularity || 0.0;
  doc.modified = metadata.modified || null;

  const otherTranslations = document.translations || [];
  if (!otherTranslations.length && metadata.translation_of) {
    // But perhaps the parent has other translations?!
    const parentURL = buildURL("en-US", metadata.translation_of);
    const parentResult = Document.findByURL(parentURL);
    // See note in 'ensureAllTitles()' about why we need this if statement.
    if (parentResult) {
      const parentOtherTranslations =
        parentResult.document.metadata.translations;
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

  return doc;
}

async function buildDocumentFromURL(url) {
  const result = Document.findByURL(url);
  if (!result) {
    return null;
  }
  return buildDocument(result.document);
}

module.exports = {
  buildDocumentFromURL,
};

async function buildDocuments() {
  const documents = Document.findAll();
  const progressBar = new cliProgress.SingleBar(
    {},
    cliProgress.Presets.shades_grey
  );
  progressBar.start(documents.count);
  for (const document of documents.iter()) {
    const builtDocument = await buildDocument(document);
    const outPath = path.join(BUILD_OUT_ROOT, slugToFoldername(document.url));
    fs.mkdirSync(outPath, { recursive: true });
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
    progressBar.increment();
  }
  progressBar.stop();
}

if (require.main === module) {
  buildDocuments().catch((error) => {
    console.error("error while building documents:", error);
  });
}
