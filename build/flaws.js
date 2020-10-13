const fs = require("fs");
const path = require("path");

const chalk = require("chalk");
const got = require("got");

const { Document, Redirect } = require("../content");
const { FLAW_LEVELS } = require("./constants");
const { packageBCD } = require("./resolve-bcd");
const {
  findMatchesInText,
  replaceMatchesInText,
} = require("./matches-in-text");

function injectFlaws(doc, $, options, { rawContent }) {
  if (doc.isArchive) return;

  injectBrokenLinksFlaws(
    options.flawLevels.get("broken_links"),
    doc,
    $,
    rawContent
  );

  injectBadBCDQueriesFlaws(options.flawLevels.get("bad_bcd_queries"), doc, $);
}

// The 'broken_links' flaw check looks for internal links that
// link to a document that's going to fail with a 404 Not Found.
function injectBrokenLinksFlaws(level, doc, $, rawContent) {
  if (level === FLAW_LEVELS.IGNORE) return;

  // This is needed because the same href can occur multiple time.
  // For example:
  //    <a href="/foo/bar">
  //    <a href="/foo/other">
  //    <a href="/foo/bar">  (again!)
  // In this case, when we call `addBrokenLink()` that third time, we know
  // this refers to the second time it appears. That's important for the
  // sake of finding which match, in the original source (rawContent),
  // it belongs to.
  const checked = new Map();

  // Our cache for looking things up by `href`. This basically protects
  // us from calling `findMatchesInText()` more than once.
  const matches = new Map();

  // A closure function to help making it easier to append flaws
  function addBrokenLink($element, index, href, suggestion = null) {
    if (!matches.has(href)) {
      matches.set(
        href,
        Array.from(
          findMatchesInText(href, rawContent, {
            attribute: "href",
          })
        )
      );
    }
    // findMatchesInText() is a generator function so use `Array.from()`
    // to turn it into an array so we can use `.forEach()` because that
    // gives us an `i` for every loop.
    matches.get(href).forEach((match, i) => {
      if (i !== index) {
        return;
      }
      if (!("broken_links" in doc.flaws)) {
        doc.flaws.broken_links = [];
      }
      const id = `link${doc.flaws.broken_links.length + 1}`;
      const explanation = `Can't resolve ${href}`;
      let fixable = false;
      if (suggestion) {
        $element.attr("href", suggestion);
        fixable = true;
      }
      $element.attr("data-flaw", id);
      doc.flaws.broken_links.push(
        Object.assign({ explanation, id, href, suggestion, fixable }, match)
      );
    });
  }

  $("a[href]").each((i, element) => {
    const a = $(element);
    const href = a.attr("href");

    // This gives us insight into how many times this exact `href`
    // has been encountered in the doc.
    // Then, when we call addBrokenLink() we can include an index so that
    // that function knows which match it's referring to.
    checked.set(href, checked.has(href) ? checked.get(href) + 1 : 0);

    if (href.startsWith("https://developer.mozilla.org/")) {
      // It might be a working 200 OK link but the link just shouldn't
      // have the full absolute URL part in it.
      const absoluteURL = new URL(href);
      addBrokenLink(
        a,
        checked.get(href),
        href,
        absoluteURL.pathname + absoluteURL.search + absoluteURL.hash
      );
    } else if (href.startsWith("/") && !href.startsWith("//")) {
      // Got to fake the domain to sensible extract the .search and .hash
      const absoluteURL = new URL(href, "http://www.example.com");
      const hrefNormalized = href.split("#")[0];
      const found = Document.findByURL(hrefNormalized);
      if (!found) {
        // Before we give up, check if it's a redirect
        const resolved = Redirect.resolve(hrefNormalized);
        if (resolved !== hrefNormalized) {
          addBrokenLink(
            a,
            checked.get(href),
            href,
            resolved + absoluteURL.search + absoluteURL.hash
          );
        } else {
          addBrokenLink(a, checked.get(href), href);
        }
      } else {
        addBrokenLink(a, href);
      }
    } else {
      // But does it have the correct case?!
      if (found.url !== href.split("#")[0]) {
        // Inconsistent case.
        addBrokenLink(
          a,
          checked.get(href),
          href,
          found.url + absoluteURL.search + absoluteURL.hash
        );
      }
    }
  });

  if (
    level === FLAW_LEVELS.ERROR &&
    doc.flaws.broken_links &&
    doc.flaws.broken_links.length
  ) {
    throw new Error(
      `broken_links flaws: ${doc.flaws.broken_links.map(JSON.stringify)}`
    );
  }
}

// Bad BCD queries are when the `<div class="bc-data">` tags have an
// ID (or even lack the `id` attribute) that don't match anything in the
// @mdn/browser-compat-data package. E.g. Something like this:
//
//    <div class="bc-data" id="bcd:never.ever.heard.of">
//
function injectBadBCDQueriesFlaws(level, doc, $) {
  if (level === FLAW_LEVELS.IGNORE) return;

  $("div.bc-data").each((i, element) => {
    const dataQuery = $(element).attr("id");
    if (!dataQuery) {
      if (!("bad_bcd_queries" in doc.flaws)) {
        doc.flaws.bad_bcd_queries = [];
      }
      doc.flaws.bad_bcd_queries.push({
        id: `bad_bcd_queries${doc.flaws.bad_bcd_queries.length}`,
        explanation: "BCD table without an ID",
        suggestion: null,
      });
    } else {
      const query = dataQuery.replace(/^bcd:/, "");
      const { data } = packageBCD(query);
      if (!data) {
        if (!("bad_bcd_queries" in doc.flaws)) {
          doc.flaws.bad_bcd_queries = [];
        }
        doc.flaws.bad_bcd_queries.push({
          id: `bad_bcd_queries${doc.flaws.bad_bcd_queries.length}`,
          explanation: `No BCD data for query: ${query}`,
          suggestion: null,
        });
      }
    }
  });
  if (
    level === FLAW_LEVELS.ERROR &&
    doc.flaws.bad_bcd_queries &&
    doc.flaws.bad_bcd_queries.length
  ) {
    throw new Error(
      `bad_bcd_queries flaws: ${doc.flaws.bad_bcd_queries.map(
        (f) => f.explanation
      )}`
    );
  }
}

async function fixFixableFlaws(doc, options, document) {
  if (!options.fixFlaws || document.isArchive) return;

  let newRawHTML = document.rawHTML;

  const loud = options.fixFlawsDryRun || options.fixFlawsVerbose;

  // Any 'macros' of type "MacroRedirectedLinkError"...
  for (const flaw of doc.flaws.macros || []) {
    if (flaw.fixable) {
      // Sanity check that our understanding of flaws, filepaths, and sources
      // work as expected.
      if (!newRawHTML.includes(flaw.macroSource)) {
        throw new Error(
          `rawHTML doesn't contain macroSource (${flaw.macroSource})`
        );
      }
      const newMacroSource = flaw.suggestion;
      // Remember, in JavaScript only the first occurrence will be replaced.
      newRawHTML = newRawHTML.replace(flaw.macroSource, newMacroSource);
      if (loud) {
        console.log(
          chalk.grey(
            `Fixed macro ${chalk.white.bold(
              flaw.macroSource
            )} to ${chalk.white.bold(newMacroSource)}`
          )
        );
      }
      // flaw.fixed = !options.fixFlawsDryRun;
    }
  }

  // Any 'broken_links' with a suggestion...
  for (const flaw of doc.flaws.broken_links || []) {
    if (!flaw.suggestion) {
      continue;
    }
    // The reason we're not using the parse HTML, as a cheerio object `$`
    // is because the raw HTML we're dealing with isn't actually proper
    // HTML. It's only proper HTML when the kumascript macros have been
    // expanded.
    newRawHTML = replaceMatchesInText(flaw.href, newRawHTML, flaw.suggestion, {
      inAttribute: "href",
    });
    if (loud) {
      console.log(
        chalk.grey(
          `Fixed broken_link ${chalk.white.bold(
            flaw.href
          )} to ${chalk.white.bold(flaw.suggestion)}`
        )
      );
    }
  }

  // Any 'images' flaws with a suggestion or external image...
  for (const flaw of doc.flaws.images || []) {
    if (!(flaw.suggestion || flaw.externalImage)) {
      continue;
    }
    // The reason we're not using the parse HTML, as a cheerio object `$`
    // is because the raw HTML we're dealing with isn't actually proper
    // HTML. It's only proper HTML when the kumascript macros have been
    // expanded.
    let newSrc;
    if (flaw.externalImage) {
      // Sanity check that it's an external image
      const url = new URL(flaw.src);
      if (url.protocol !== "https:") {
        throw new Error(`Insecure image URL ${flaw.src}`);
      }
      try {
        const imageBuffer = await got(flaw.src, {
          responseType: "buffer",
          resolveBodyOnly: true,
          timeout: 10000,
          retry: 3,
        });
        const destination = path.join(
          Document.getFolderPath(document.metadata),
          path
            .basename(decodeURI(url.pathname))
            .replace(/\s+/g, "_")
            .toLowerCase()
        );
        fs.writeFileSync(destination, imageBuffer);
        console.log(`Downloaded ${flaw.src} to ${destination}`);
        newSrc = path.basename(destination);
      } catch (error) {
        console.error(error);
        throw error;
      }
    } else {
      newSrc = flaw.suggestion;
    }
    newRawHTML = replaceMatchesInText(flaw.src, newRawHTML, newSrc, {
      inAttribute: "src",
    });
    if (loud) {
      console.log(
        chalk.grey(
          `Fixed image ${chalk.white.bold(flaw.src)} to ${chalk.white.bold(
            newSrc
          )}`
        )
      );
    }
  }

  // Finally, summarized what happened...
  if (newRawHTML !== document.rawHTML) {
    // It changed the raw HTML of the source. So deal with this.
    if (options.fixFlawsDryRun) {
      console.log(
        chalk.yellow(
          `Would have modified "${document.fileInfo.path}", if this was not a dry run.`
        )
      );
    } else {
      Document.update(document.fileInfo.folder, newRawHTML, document.metadata);
      if (options.fixFlawsVerbose) {
        console.log(
          chalk.green(
            `Modified "${chalk.bold(
              document.fileInfo.path
            )}" from fixable flaws.`
          )
        );
      }
    }
  }
}

module.exports = { injectFlaws, fixFixableFlaws };
