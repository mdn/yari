const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");

const chalk = require("chalk");
const packageJson = require("../../package.json");

require("dotenv").config({ path: process.env.ENV_FILE });

const cheerio = require("./monkeypatched-cheerio");
const Document = require("./document");
const {
  extractDocumentSections,
  extractSidebar,
} = require("./document-extractor");
const {
  CONTENT_ROOT,
  VALID_LOCALES,
  FLAW_LEVELS,
  DEFAULT_LIVE_SAMPLES_BASE_URL,
  DEFAULT_INTERACTIVE_EXAMPLES_BASE_URL,
} = require("./constants");
const { injectFlaws } = require("./flaws");
const { resolveRedirect } = require("./redirects");
const { slugToFoldername } = require("./utils");

const kumascript = require("kumascript");

function getCurretGitHubBaseURL() {
  return packageJson.repository;
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

/** Needs doc string */
function buildURL(locale, slug) {
  if (!locale) throw new Error("locale falsy!");
  if (!slug) throw new Error("slug falsy!");
  return `/${locale}/docs/${slug}`.toLowerCase();
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

// Returns a lowercase URI with common irregularities repaired.
function repairURL(url) {
  url = url.trim().toLowerCase();
  if (!url.startsWith("/")) {
    // Ensure the URI starts with a "/".
    url = "/" + url;
  }
  // Remove redundant forward slashes, like "//".
  url = url.replace(/\/{2,}/g, "/");
  // Ensure the URI starts with a valid locale.
  const maybeLocale = url.split("/")[1];
  if (!VALID_LOCALES.has(maybeLocale)) {
    if (maybeLocale === "en") {
      // Converts URI's like "/en/..." to "/en-us/...".
      url = url.replace(`/${maybeLocale}`, "/en-us");
    } else {
      // Converts URI's like "/web/..." to "/en-us/web/...", or
      // URI's like "/docs/..." to "/en-us/docs/...".
      url = "/en-us" + url;
    }
  }
  // Ensure the locale is followed by "/docs".
  const [locale, maybeDocs] = url.split("/").slice(1, 3);
  if (maybeDocs !== "docs") {
    // Converts URI's like "/en-us/web/..." to "/en-us/docs/web/...".
    url = url.replace(`/${locale}`, `/${locale}/docs`);
  }
  return url;
}

const macroRenderer = new kumascript.Renderer({
  uriTransform: resolveRedirect,
  liveSamplesBaseUrl: DEFAULT_LIVE_SAMPLES_BASE_URL,
  interactiveExamplesBaseUrl: DEFAULT_INTERACTIVE_EXAMPLES_BASE_URL,
});

macroRenderer.use({
  get: (url) => findDocument(url).document,
  *[Symbol.iterator]() {},
});

async function renderMacros(contentRoot, { rawHtml, metadata, fileInfo }) {
  // First, render all of the prerequisites of this document.
  const allPrerequisiteFlaws = (
    await Promise.all(
      Array.from(kumascript.getPrerequisites(rawHtml)).map(async (preURL) => {
        const preCleanURL = resolveRedirect(preURL);
        const folder = slugToFoldername(preCleanURL);
        const document = Document.read(contentRoot, folder);
        if (!document) {
          throw new Error(`No document found for: ${folder}`);
        }
        // When rendering prerequisites, we're only interested in
        // caching the results for later use. We don't care about
        // the results returned.
        const [, preFlaws] = await renderMacros(contentRoot, document);
        // Flatten the flaws from this other document into the current flaws,
        // and set the filepath for flaws that haven't already been set at
        // a different level of recursion.
        return preFlaws.map((flaw) => ({
          ...flaw,
          filepath: flaw.filepath || fileInfo.path,
        }));
      })
    )
  ).flat();

  // Now that all of the prerequisites have been rendered, we can render
  // this document and return the result.
  const url = buildURL(metadata.locale, metadata.slug).toLowerCase();
  const [renderedHtml, flaws] = await macroRenderer.render(rawHtml, {
    path: url,
    url: `${"this.options.sitemapBaseUrl"}${url}`,
    locale: metadata.locale,
    slug: metadata.slug,
    title: metadata.title,
    tags: metadata.tags || [],
    selective_mode: false,
  });

  // Add the flaws from rendering the macros within all of the prerequisite
  // documents to the flaws from rendering the macros within this document.
  return [renderedHtml, flaws.concat(allPrerequisiteFlaws)];
}

/**
 * Recursive method that renders the macros within the document
 * represented by this source, URI, metadata and raw HTML, as
 * well as builds any live samples within this document or within
 * other documents referenced by this document.
 */
async function renderMacrosAndBuildLiveSamples(
  contentRoot,
  document,
  url,
  { selectedSampleIDs = null } = {}
) {
  // First, render the macros to get the rendered HTML.
  const [renderedHtml, flaws] = await renderMacros(contentRoot, document);

  // Next, let's find any samples that we need to build, and note
  // that one or more or even all might be within other documents.
  let ownSampleIds;
  let otherSampleIds = null;
  if (selectedSampleIDs) {
    ownSampleIds = selectedSampleIDs;
  } else {
    [ownSampleIds, otherSampleIds] = kumascript.getLiveSampleIDs(
      document.metadata.slug,
      document.rawHtml
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
          document.metadata.title,
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
    const otherUri = buildURL(document.metadata.locale, slug);
    const otherCleanUri = resolveRedirect(otherUri);
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
    const {
      fileInfo: { path: otherRawHtmlFilepath },
    } = Document.read(contentRoot, otherFolder);
    const otherResult = await renderMacrosAndBuildLiveSamples(
      contentRoot,
      document,
      url,
      {
        selectedSampleIDs: sampleIDs,
      }
    );
    const otherFlaws = otherResult[1];
    // Flatten the flaws from this other document into the current flaws,
    // and set the filepath for flaws that haven't already been set at
    // a different level of recursion.
    for (const flaw of otherFlaws) {
      if (!flaw.filepath) {
        flaw.filepath = otherRawHtmlFilepath;
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
  const gitURL = getCurretGitHubBaseURL();
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

/** The breadcrumb is an array of parents include the document itself.
 * It only gets added to the document there are actual parents.
 */
function addBreadcrumbData(contentRoot, url, document) {
  const parents = [];
  let split = url.split("/");
  let parentUri;
  while (split.length > 2) {
    split.pop();
    parentUri = split.join("/");
    // This test makes it possible to "skip" certain URIs that might not
    // be a page on its own. For example: /en-US/docs/Web/ is a page,
    // and so is /en-US/ but there might not be a page for /end-US/docs/.
    const metadata = Document.read(contentRoot, parentUri);
    if (metadata) {
      parents.unshift({
        uri: parentUri,
        title: metadata.title,
      });
    }
  }
  if (parents.length) {
    parents.push({
      uri: url,
      title: document.short_title || document.title,
    });
    document.parents = parents;
  }
}

async function buildDocument(url) {
  const result = Document.findByURL(url);
  if (!result) {
    return null;
  }
  const { contentRoot, folder, document } = result;

  const doc = {};

  doc.flaws = {};

  let [renderedHtml, flaws] = await renderMacrosAndBuildLiveSamples(
    contentRoot,
    document,
    url
  );

  const { metadata, fileInfo } = document;
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
          `Flaws (${flaws.length}) within ${url} while rendering macros:`
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
  doc.mdn_url = url;
  if (metadata.translation_of) {
    doc.translation_of = metadata.translation_of;
  }

  // Note that 'extractSidebar' will always return a string.
  // And if it finds a sidebar section, it gets removed from '$' too.
  // Also note, these operations mutate the `$`.
  doc.sidebarHTML = extractSidebar($);

  // With the sidebar out of the way, go ahead and check the rest
  injectFlaws(contentRoot, doc, $);

  // Post process HTML so that the right elements gets tagged so they
  // *don't* get translated by tools like Google Translate.
  injectNoTranslate($);

  doc.body = extractDocumentSections($);

  doc.popularity = metadata.popularity || 0.0;
  doc.modified = metadata.modified;

  const otherTranslations = document.translations || [];
  if (!otherTranslations.length && metadata.translation_of) {
    // But perhaps the parent has other translations?!
    const parentURL = buildURL("en-US", metadata.translation_of);
    const parentData = Document.read(parentURL);
    // See note in 'ensureAllTitles()' about why we need this if statement.
    if (parentData) {
      const parentOtherTranslations = parentData.translations;
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

  injectSource(doc, folder);

  // The `titles` object should contain every possible URI->Title mapping.
  // We can use that generate the necessary information needed to build
  // a breadcrumb in the React componentx.
  addBreadcrumbData(contentRoot, url, doc);

  return doc;
}

function* walker(root, depth = 0) {
  const files = fs.readdirSync(root);
  if (!depth) {
    yield [
      root,
      files.filter((name) => {
        return !fs.statSync(path.join(root, name)).isDirectory();
      }),
    ];
  }
  for (const name of files) {
    const filepath = path.join(root, name);
    const isDirectory = fs.statSync(filepath).isDirectory();
    if (isDirectory) {
      yield [
        filepath,
        fs.readdirSync(filepath).filter((name) => {
          return !fs.statSync(path.join(filepath, name)).isDirectory();
        }),
      ];
      // Now go deeper
      yield* walker(filepath, depth + 1);
    }
  }
}

function buildAll() {
  for (const thing of walker(CONTENT_ROOT)) {
    console.log({ thing });
  }
}

// buildAll();

module.exports = {
  buildDocument,
};
