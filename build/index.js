const childProcess = require("child_process");
const fs = require("fs");
const path = require("path");

const chalk = require("chalk");
const cliProgress = require("cli-progress");
const packageJSON = require("../package.json");

const {
  CONTENT_ROOT,
  buildURL,
  Document,
  Redirect,
  slugToFoldername,
} = require("content");
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
const options = require("./build-options");

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

async function buildDocument(document) {
  const { metadata, fileInfo } = document;

  const doc = {};

  doc.flaws = {};

  const [renderedHtml, flaws] = await kumascript.render(document.url);

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

async function buildLiveSamplePageFromURL(url) {
  const [documentURL, sampleID] = url.split("/_samples_/");
  const { document } = Document.findByURL(documentURL);
  const liveSamplePage = kumascript.buildLiveSamplePage(
    document.url,
    document.metadata.title,
    (await kumascript.render(document.url))[0],
    { id: sampleID, createFlaw() {} }
  );
  return liveSamplePage.html;
}

module.exports = {
  buildDocumentFromURL,
  buildLiveSamplePageFromURL,
};

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

  console.log(options);

  if (!documents.count) {
    console.warn("No documents to build found");
    return;
  }

  !options.noProgressbar && progressBar.start(documents.count);
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

    const { locale, slug } = document.metadata;
    if (!slugPerLocale[locale]) {
      slugPerLocale[locale] = [];
    }
    slugPerLocale[locale].push(slug);

    if (!options.noProgressbar) {
      progressBar.increment();
    } else {
      console.log(outPath);
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
}

if (require.main === module) {
  buildDocuments().catch((error) => {
    console.error("error while building documents:", error);
  });
}
