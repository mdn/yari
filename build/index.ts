import fs from "node:fs";
import path from "node:path";

import chalk from "chalk";
import * as cheerio from "cheerio";
import * as Sentry from "@sentry/node";

import {
  MacroInvocationError,
  MacroLiveSampleError,
  MacroRedirectedLinkError,
} from "../kumascript/src/errors.js";

import { Doc } from "../libs/types/document.js";
import { Document, execGit, slugToFolder } from "../content/index.js";
import { CONTENT_ROOT, REPOSITORY_URLS } from "../libs/env/index.js";
import * as kumascript from "../kumascript/index.js";

import { DEFAULT_LOCALE, FLAW_LEVELS } from "../libs/constants/index.js";
import { extractSections } from "./extract-sections.js";
import { extractSidebar } from "./extract-sidebar.js";
import { extractSummary } from "./extract-summary.js";
import { addBreadcrumbData } from "./document-utils.js";
import {
  fixFixableFlaws,
  injectFlaws,
  injectSectionFlaws,
} from "./flaws/index.js";
import { checkImageReferences, checkImageWidths } from "./check-images.js";
import { getPageTitle } from "./page-title.js";
import { syntaxHighlight } from "./syntax-highlight.js";
import { formatNotecards } from "./format-notecards.js";
import buildOptions from "./build-options.js";
import LANGUAGES_RAW from "../libs/languages/index.js";
import { safeDecodeURIComponent } from "../kumascript/src/api/util.js";
import { wrapTables } from "./wrap-tables.js";
import {
  getAdjacentFileAttachments,
  injectLoadingLazyAttributes,
  injectNoTranslate,
  makeTOC,
  postLocalFileLinks,
  postProcessExternalLinks,
  postProcessSmallerHeadingIDs,
} from "./utils.js";
import { getWebFeatureStatus } from "./web-features.js";
import { rewritePageTitleForSEO } from "./seo.js";
export { default as SearchIndex } from "./search-index.js";
export { gather as gatherGitHistory } from "./git-history.js";
export { buildSPAs } from "./spas.js";

const LANGUAGES = new Map(
  Object.entries(LANGUAGES_RAW).map(([locale, data]) => {
    return [locale.toLowerCase(), data];
  })
);

const DEFAULT_BRANCH_NAME = "main"; // That's what we use for github.com/mdn/content

// Module-level cache
const rootToGitBranchMap = new Map();

function getCurrentGitBranch(root: string) {
  if (!rootToGitBranchMap.has(root)) {
    // If this is running in a GitHub Action "PR Build" workflow the current
    // branch name will be set in `GITHUB_REF_NAME_SLUG`.
    let name = DEFAULT_BRANCH_NAME;
    // Only bother getting fancy if the root is CONTENT_ROOT.
    // For other possible roots, just leave it to the default.
    if (root === CONTENT_ROOT) {
      if (process.env.GITHUB_REF) {
        name = process.env.GITHUB_REF.split("/").slice(2).join("/");
      } else {
        // Most probably, you're hacking on the content, using Yari to preview,
        // in a topic branch. Then figure this out using a child-process.
        // Note, if you're in detached head, (e.g. "d6a6c3f17") instead of a named
        // branch, this will fail. But that's why we rely on a default.
        try {
          const output = execGit(["branch", "--show-current"], {
            cwd: root,
          });
          if (output) {
            name = output;
          }
        } catch (e) {
          /* allowed to fail for non git content root */
        }
      }
    }

    rootToGitBranchMap.set(root, name);
  }
  return rootToGitBranchMap.get(root);
}

/** Throw an error if the slug is insane.
 * This helps breaking the build if someone has put in faulty data into
 * the content (metadata file).
 * If all is well, do nothing. Nothing is expected to return.
 */
function validateSlug(slug: string) {
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
 * Find all `<div class="warning">` and turn them into `<div class="warning notecard">`
 * and keep in mind that if it was already been manually fixed so, you
 * won't end up with `<div class="warning notecard notecard">`.
 *
 * @param {Cheerio document instance} $
 */
function injectNotecardOnWarnings($: cheerio.CheerioAPI) {
  $("div.warning, div.note, div.blockIndicator")
    .addClass("notecard")
    .removeClass("blockIndicator");
}

/**
 * Return the full URL directly to the file in GitHub based on this folder.
 * @param {String} folder - the current folder we're processing.
 */
function getGitHubURL(root: string, folder: string, filename: string) {
  const baseURL = `https://github.com/${REPOSITORY_URLS[root]}`;
  return `${baseURL}/blob/${getCurrentGitBranch(
    root
  )}/files/${folder}/${filename}`;
}

/**
 * Return the full URL directly to the last commit affecting this file on GitHub.
 * @param {String} hash - the full hash to point to.
 */
export function getLastCommitURL(root: string, hash: string) {
  const baseURL = `https://github.com/${REPOSITORY_URLS[root]}`;
  return `${baseURL}/commit/${hash}`;
}

function injectSource(doc, document, metadata) {
  const folder = document.fileInfo.folder;
  const root = document.fileInfo.root;
  const filename = path.basename(document.fileInfo.path);
  doc.source = {
    folder,
    github_url: getGitHubURL(root, folder, filename),
    last_commit_url: getLastCommitURL(root, metadata.hash),
    filename,
  };
}

export interface BuiltDocument {
  doc: Doc;
  liveSamples: any;
  fileAttachmentMap: Map<string, string>;
  source?: {
    github_url: string;
  };
  plainHTML?: string;
}

interface DocumentOptions {
  fixFlaws?: boolean;
  fixFlawsDryRun?: boolean;
  fixFlawsTypes?: Iterable<string>;
  fixFlawsVerbose?: boolean;
  plainHTML?: boolean;
}

export async function buildDocument(
  document,
  documentOptions: DocumentOptions = {}
): Promise<BuiltDocument> {
  Sentry.setContext("doc", {
    path: document?.fileInfo?.path,
    title: document?.metadata?.title,
    url: document?.url,
  });
  Sentry.setTags({
    doc_slug: document?.metadata?.slug,
    doc_locale: document?.metadata?.locale,
  });
  // Important that the "local" document options comes last.
  // And use Object.assign to create a new object instead of mutating the
  // global one.
  const options = {
    ...buildOptions,
    ...documentOptions,
  };
  const { metadata, fileInfo } = document;

  if (Document.urlToFolderPath(document.url) !== document.fileInfo.folder) {
    throw new Error(
      `The document's slug (${metadata.slug}) doesn't match its disk folder name (${document.fileInfo.folder})`
    );
  }

  const doc = {
    isMarkdown: document.isMarkdown,
    isTranslated: document.isTranslated,
    isActive: document.isActive,
    flaws: {},
  } as Partial<Doc>;

  interface LiveSample {
    id: string;
    html: string;
    slug?: string;
  }

  let flaws: any[] = [];
  let $: cheerio.CheerioAPI = null;
  const liveSamples: LiveSample[] = [];
  // this will get populated with the parent's frontmatter by kumascript if the document is localized:
  let allMetadata = metadata;

  try {
    let kumascriptMetadata;
    [$, flaws, kumascriptMetadata] = await kumascript.render(document.url);
    allMetadata = { ...allMetadata, ...kumascriptMetadata };
  } catch (error) {
    if (
      error instanceof MacroInvocationError &&
      error.name === "MacroInvocationError"
    ) {
      // The source HTML couldn't even be parsed! There's no point allowing
      // anything else move on.
      // But considering that this might just be one of many documents you're
      // building, let's at least help by setting a more user-friendly error
      // message.
      error.updateFileInfo(document.fileInfo);
      throw new Error(
        `MacroInvocationError trying to parse file.\n\nFile:    ${error.filepath}\nMessage: ${error.error.message}\n\n${error.sourceContext}`
      );
    }
    // Any other unexpected error re-thrown.
    throw error;
  }

  const liveSamplePages = await kumascript.buildLiveSamplePages(
    document.url,
    document.metadata.title,
    $,
    document.rawBody
  );
  for (const liveSamplePage of liveSamplePages) {
    const { id, flaw, slug } = liveSamplePage;
    let { html } = liveSamplePage;
    if (flaw) {
      flaw.updateFileInfo(fileInfo);
      if (flaw.name === "MacroLiveSampleError") {
        // As of April 2021 there are 0 pages in mdn/content that trigger
        // a MacroLiveSampleError. So we can be a lot more strict with en-US
        // until the translated-content has had a chance to clean up all
        // their live sample errors.
        // See https://github.com/mdn/yari/issues/2489
        if (document.metadata.locale === "en-US") {
          throw new Error(
            `MacroLiveSampleError within ${flaw.filepath}, line ${flaw.line} column ${flaw.column} (${flaw.error.message})`
          );
        } else {
          console.warn(
            `MacroLiveSampleError within ${flaw.filepath}, line ${flaw.line} column ${flaw.column} (${flaw.error.message})`
          );
        }
      }
      flaws.push(flaw);
      html = `<!doctype html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Live sample failed!</title>
            <style type="text/css">
              body {
                background-color: #fae4e5;
              }
            </style>
          </head>
          <body>
            <h1>Live sample failed!</h1>
            <p>
              An error occurred trying to render this live sample.
              <br>
              Consider filing an issue or trying your hands at a fix of your own.
            </p>
            <p><b>Error details:</b></p>
            <p>
              <code>${flaw.error.toString()}</code>
            </p>
          </body>
        </html>
        `;
    }
    liveSamples.push({ id: id.toLowerCase(), html, slug });
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
      // // XXX This is probably the wrong way to bubble up.
      // process.exit(1);
      throw new Error("Flaw error encountered");
    } else if (options.flawLevels.get("macros") === FLAW_LEVELS.WARN) {
      // doc.flaws.macros = flaws;
      // The 'flaws' array don't have everything we need from the
      // kumascript rendering, so we "beef it up" to have convenient
      // attributes needed.
      doc.flaws = doc.flaws ?? {};
      doc.flaws.macros = flaws.map((flaw: any, i) => {
        let fixable = false;
        let suggestion: string | null = null;
        if (flaw.name === "MacroDeprecatedError") {
          fixable = true;
          suggestion = "";
        } else if (
          flaw.name === "MacroRedirectedLinkError" &&
          (!(flaw as MacroRedirectedLinkError).filepath ||
            (flaw as MacroRedirectedLinkError).filepath ===
              document.fileInfo.path)
        ) {
          fixable = true;
          suggestion = (flaw as MacroRedirectedLinkError).macroSource.replace(
            (flaw as MacroRedirectedLinkError).redirectInfo.current,

            (flaw as MacroRedirectedLinkError).redirectInfo.suggested
          );
        }
        const id = `macro${i}`;
        const explanation = flaw.error.message;
        return Object.assign({ id, fixable, suggestion, explanation }, flaw);
      });
    }
  }

  // TODO: The slug should always match the folder name.
  // If you edit the slug bug don't correctly edit the folder it's in
  // it's going to lead to confusion.
  // We can use the utils.slugToFolder() function and compare
  // its output with the `folder`.
  validateSlug(metadata.slug);

  // EmbedLiveSamples carry their token information to enrich flaw error
  // messages, these should not be in the final output
  $("[data-token]").removeAttr("data-token");

  // Kumascript rendering can't know about FLAW_LEVELS when it's building,
  // because injecting it there would cause a circular dependency.
  // So, let's post-process the rendered HTML now afterwards.
  // If the flaw levels for `macros` was to ignore, we can delete all the
  // injected `data-flaw-src="..."` attributes.
  if (options.flawLevels.get("macros") === FLAW_LEVELS.IGNORE) {
    // This helps the final production built HTML since there `data-flaw-src`
    // attributes on the HTML is useless.
    $("[data-flaw-src]").removeAttr("data-flaw-src");
  }

  doc.title = metadata.title || "";
  doc.mdn_url = document.url;
  doc.locale = metadata.locale as string;
  doc.native = LANGUAGES.get(doc.locale.toLowerCase())?.native;

  // metadata doesn't have a browser-compat key on translated docs:
  const browserCompat = allMetadata["browser-compat"];
  doc.browserCompat =
    browserCompat &&
    (Array.isArray(browserCompat) ? browserCompat : [browserCompat]);

  doc.baseline = addBaseline(doc);

  // If the document contains <math> HTML, it will set `doc.hasMathML=true`.
  // The client (<Document/> component) needs to know this for loading polyfills.
  if ($("math").length > 0) {
    doc.hasMathML = true;
  }

  // Note that 'extractSidebar' will always return a string.
  // And if it finds a sidebar section, it gets removed from '$' too.
  // Also note, these operations mutate the `$`.
  extractSidebar($, doc);

  // Check and scrutinize any local image references
  const fileAttachmentMap = checkImageReferences(doc, $, options, document);
  // Not all images are referenced as `<img>` tags. Some are just sitting in the
  // current document's folder and they might be referenced in live samples.
  // The checkImageReferences() does 2 things. Checks image *references* and
  // it returns which images it checked. But we'll need to complement any
  // other images in the folder.
  getAdjacentFileAttachments(path.dirname(document.fileInfo.path)).forEach(
    (fp) => fileAttachmentMap.set(path.basename(fp), fp)
  );

  if (doc.locale !== DEFAULT_LOCALE) {
    // If it's not the default locale, we need to add the images
    // from the default locale too.
    const defaultLocaleDir = path.join(
      CONTENT_ROOT,
      DEFAULT_LOCALE.toLowerCase(),
      slugToFolder(metadata.slug)
    );

    if (fs.existsSync(defaultLocaleDir)) {
      getAdjacentFileAttachments(defaultLocaleDir).forEach((fp) => {
        const basename = path.basename(fp);
        if (!fileAttachmentMap.has(basename)) {
          fileAttachmentMap.set(basename, fp);
        }
      });
    }
  }

  // Check the img tags for possible flaws and possible build-time rewrites
  checkImageWidths(doc, $, options, document);

  // With the sidebar out of the way, go ahead and check the rest
  try {
    injectFlaws(doc, $, options, document);
  } catch (error) {
    console.warn(
      `Injecting flaws into ${document.fileInfo.path} (${document.url}) failed.`
    );
    throw error;
  }

  // If fixFlaws is on and the doc has fixable flaws, this returned
  // raw HTML string will be different.
  try {
    await fixFixableFlaws(doc, options, document);
  } catch (error) {
    console.error(error);
    throw error;
  }

  // Dump HTML for GPT context.
  let plainHTML;
  if (documentOptions.plainHTML) {
    plainHTML = $.html();
  }

  // Apply syntax highlighting all <pre> tags.
  syntaxHighlight($, doc);

  // Post process HTML so that the right elements gets tagged so they
  // *don't* get translated by tools like Google Translate.
  injectNoTranslate($);

  // Add the `loading=lazy` HTML attribute to the appropriate elements.
  injectLoadingLazyAttributes($);

  // All external hyperlinks should have the `external` class name.
  postProcessExternalLinks($);

  // All internal hyperlinks to a file should become "absolute" URLs
  postLocalFileLinks($, doc);

  // Since all anchor links are forced into lower case, and `<h2>` and `<h3>`
  // is taken care of by the React rendering itself, we have to post-process
  // any possible headings whose ID might not be perfect.
  // The reason we can't do this as part of the kumascript rendering is because
  // the old
  postProcessSmallerHeadingIDs($);

  // All content that uses `<div class="warning">` needs to become
  // `<div class="warning notecard">` instead.
  // Some day, we can hopefully do a mass search-and-replace so we never
  // need to do this code here.
  // We might want to delete this injection in 2021 some time when all content's
  // raw HTML has been fixed to always have it in there already.
  injectNotecardOnWarnings($);

  formatNotecards($);

  wrapTables($);

  // Turn the $ instance into an array of section blocks. Most of the
  // section blocks are of type "prose" and their value is a string blob
  // of HTML.
  try {
    const [sections, sectionFlaws] = await extractSections($);
    doc.body = sections;
    if (sectionFlaws.length) {
      injectSectionFlaws(doc, sectionFlaws, options);
    }
  } catch (error) {
    // If you run `yarn build` and an error is thrown inside `extractSections()`
    // you won't know which file it was in the middle processing because
    // the error won't be able to mention that.
    // So we catch the error, log which file it happened to and then
    // rethrow the error. Now you get a clue at least as to where to look.
    console.error(
      `Extracting sections failed in ${doc.mdn_url} (${document.fileInfo.path})`
    );
    throw error;
  }

  // Extract all the <h2> tags as they appear into an array.
  doc.toc = makeTOC(doc);

  // The summary comes from the HTML and potentially the <h2>Summary</h2>
  // section. It's always a plain text string.
  doc.summary = extractSummary(doc.body);

  // If the document has a `.popularity` make sure don't bother with too
  // many significant figures on it.
  doc.popularity = metadata.popularity
    ? Number(metadata.popularity.toFixed(4))
    : 0.0;

  doc.modified = metadata.modified || null;

  doc.other_translations = document.translations || [];

  injectSource(doc, document, metadata);

  if (document.metadata["short-title"]) {
    doc.short_title = document.metadata["short-title"];
  }
  // The `titles` object should contain every possible URI->Title mapping.
  // We can use that generate the necessary information needed to build
  // a breadcrumb in the React component.
  addBreadcrumbData(document.url, doc);

  const pageTitle = getPageTitle(doc);
  doc.pageTitle = rewritePageTitleForSEO(doc.mdn_url, pageTitle);

  // Decide whether it should be indexed (sitemaps, robots meta tag, search-index)
  doc.noIndexing =
    metadata.slug === "MDN/Kitchensink" ||
    document.metadata.slug.startsWith("orphaned/") ||
    document.metadata.slug.startsWith("conflicting/");

  return { doc: doc as Doc, liveSamples, fileAttachmentMap, plainHTML };
}

function addBaseline(doc: Partial<Doc>) {
  if (doc.browserCompat) {
    const filteredBrowserCompat = doc.browserCompat.filter(
      (query) =>
        // temporary blocklist while we wait for per-key baseline statuses
        // or another solution to the baseline/bcd table discrepancy problem
        ![
          // https://github.com/web-platform-dx/web-features/blob/cf718ad/feature-group-definitions/async-clipboard.yml
          "api.Clipboard.read",
          "api.Clipboard.readText",
          "api.Clipboard.write",
          "api.Clipboard.writeText",
          "api.ClipboardEvent",
          "api.ClipboardEvent.ClipboardEvent",
          "api.ClipboardEvent.clipboardData",
          "api.ClipboardItem",
          "api.ClipboardItem.ClipboardItem",
          "api.ClipboardItem.getType",
          "api.ClipboardItem.presentationStyle",
          "api.ClipboardItem.types",
          "api.Navigator.clipboard",
          "api.Permissions.permission_clipboard-read",
          // https://github.com/web-platform-dx/web-features/blob/cf718ad/feature-group-definitions/custom-elements.yml
          "api.CustomElementRegistry",
          "api.CustomElementRegistry.builtin_element_support",
          "api.CustomElementRegistry.define",
          "api.Window.customElements",
          "css.selectors.defined",
          "css.selectors.host",
          "css.selectors.host-context",
          "css.selectors.part",
          // https://github.com/web-platform-dx/web-features/blob/cf718ad/feature-group-definitions/input-event.yml
          "api.Element.input_event",
          "api.InputEvent.InputEvent",
          "api.InputEvent.data",
          "api.InputEvent.dataTransfer",
          "api.InputEvent.getTargetRanges",
          "api.InputEvent.inputType",
        ].includes(query)
    );
    return getWebFeatureStatus(...filteredBrowserCompat);
  }
}

interface BuiltLiveSamplePage {
  id: string;
  html: string | null;
  flaw: MacroLiveSampleError | null;
}

export async function buildLiveSamplePageFromURL(url: string) {
  // The 'url' is expected to be something
  // like '/en-us/docs/foo/bar/_sample_.myid.html' and from that we want to
  // extract '/en-us/docs/foo/bar' and 'myid'. But only if it matches.
  if (!url.endsWith(".html") || !url.includes("/_sample_.")) {
    throw new Error(`Unexpected URL format to extract live sample ('${url}')`);
  }
  const [documentURL, sampleID] = url.split(/\.html$/)[0].split("/_sample_.");
  const decodedSampleID = safeDecodeURIComponent(sampleID).toLowerCase();
  const document = Document.findByURL(documentURL);
  if (!document) {
    throw new Error(`No document found for ${documentURL}`);
  }
  const liveSamplePage = (
    (await kumascript.buildLiveSamplePages(
      document.url,
      document.metadata.title,
      (await kumascript.render(document.url))[0],
      document.rawBody
    )) as BuiltLiveSamplePage[]
  ).find((page) => page.id.toLowerCase() == decodedSampleID);

  if (liveSamplePage) {
    if (liveSamplePage.flaw) {
      throw new Error(liveSamplePage.flaw.toString());
    }
    return liveSamplePage.html;
  }

  throw new Error(
    `No live-sample "${decodedSampleID}" found within ${documentURL}`
  );
}

// This is used by the builder (yarn build) and by the server (JIT).
// Someday, this function might change if we decide to include the list
// of GitHub usernames that have contributed to it since it moved to GitHub.
export function renderContributorsTxt(
  wikiContributorNames: string[] | null = null,
  githubURL: string | null = null
) {
  let txt = "";
  if (githubURL) {
    // Always show this first
    txt += `# Contributors by commit history\n${githubURL}\n\n`;
  }
  if (wikiContributorNames) {
    txt += `# Original Wiki contributors\n${wikiContributorNames.join("\n")}\n`;
  }
  return txt;
}
