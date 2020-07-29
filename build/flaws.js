const chalk = require("chalk");

const { Document, Redirect } = require("content");
const { FLAW_LEVELS } = require("./constants");
const { packageBCD } = require("./resolve-bcd");
const {
  findMatchesInText,
  replaceMatchesInText,
} = require("./matches-in-text");

function injectFlaws(doc, $, options, { rawContent }) {
  if (doc.isArchive) return;

  // The 'broken_links' flaw check looks for internal links that
  // link to a document that's going to fail with a 404 Not Found.
  if (options.flawLevels.get("broken_links") !== FLAW_LEVELS.IGNORE) {
    // This is needed because the same href can occur multiple time.
    // Especially when there's...
    //    <a href="/foo/bar#one">
    //    <a href="/foo/bar#two">
    const checked = new Set();

    // A closure function to help making it easier to append flaws
    function addBrokenLink(href, suggestion = null) {
      if (!("broken_links" in doc.flaws)) {
        doc.flaws.broken_links = [];
      }

      for (const match of findMatchesInText(href, rawContent, {
        inQuotes: true,
      })) {
        doc.flaws.broken_links.push(Object.assign({ href, suggestion }, match));
      }
    }

    $("a[href]").each((i, element) => {
      const a = $(element);
      const href = a.attr("href");
      if (checked.has(href)) return;
      checked.add(href);

      if (href.startsWith("https://developer.mozilla.org/")) {
        // It might be a working 200 OK link but the link just shouldn't
        // have the full absolute URL part in it.
        const absoluteURL = new URL(href);
        addBrokenLink(
          href,
          absoluteURL.pathname + absoluteURL.search + absoluteURL.hash
        );
      } else if (href.startsWith("/") && !href.startsWith("//")) {
        // Got to fake the domain to sensible extract the .search and .hash
        const absoluteURL = new URL(href, "http://www.example.com");
        const hrefNormalized = href.split("#")[0];
        const found = Document.findByURL(hrefNormalized, { metadata: true });
        if (!found) {
          // Before we give up, check if it's a redirect
          const resolved = Redirect.resolve(hrefNormalized);
          if (resolved) {
            // Just because it's a redirect doesn't mean it ends up
            // on a page we have.
            // For example, there might be a redirect but where it
            // goes to is not in this.allTitles.
            // This can happen if it's a "fundamental redirect" for example.
            const finalDocument = Document.findByURL(resolved, {
              metadata: true,
            });
            addBrokenLink(
              href,
              finalDocument
                ? finalDocument.url + absoluteURL.search + absoluteURL.hash
                : null
            );
          } else {
            addBrokenLink(href);
          }
        } else {
          // But does it have the correct case?!
          if (found.url !== href.split("#")[0]) {
            // Inconsistent case.
            addBrokenLink(
              href,
              found.url + absoluteURL.search + absoluteURL.hash
            );
          }
        }
      }
    });
    if (options.flawLevels.get("broken_links") === FLAW_LEVELS.ERROR) {
      throw new Error(`broken_links flaws: ${doc.flaws.broken_links}`);
    }
  }

  if (options.flawLevels.get("bad_bcd_queries") !== FLAW_LEVELS.IGNORE) {
    $("div.bc-data").each((i, element) => {
      const dataQuery = $(element).attr("id");
      if (!dataQuery) {
        if (!("bad_bcd_queries" in doc.flaws)) {
          doc.flaws.bad_bcd_queries = [];
        }
        doc.flaws.bad_bcd_queries.push("BCD table without an ID");
      } else {
        const query = dataQuery.replace(/^bcd:/, "");
        const data = packageBCD(query);
        if (!data) {
          if (!("bad_bcd_queries" in doc.flaws)) {
            doc.flaws.bad_bcd_queries = [];
          }
          doc.flaws.bad_bcd_queries.push(`No BCD data for query: ${query}`);
        }
      }
    });
    if (options.flawLevels.get("broken_links") === FLAW_LEVELS.ERROR) {
      throw new Error(`bad_bcd_queries flaws: ${doc.flaws.bad_bcd_queries}`);
    }
  }
}

function fixFixableFlaws(doc, options, document) {
  if (!options.fixFlaws || document.isArchive) return;

  let newRawHTML = document.rawHtml;

  const loud = options.fixFlawsDryRun || options.fixFlawsVerbose;

  // Any 'macros' of type "MacroRedirectedLinkError"...
  for (const flaw of doc.flaws.macros || []) {
    if (
      flaw.name === "MacroRedirectedLinkError" &&
      (!flaw.filepath || flaw.filepath === document.fileInfo.path)
    ) {
      // Sanity check that our understanding of flaws, filepaths, and sources
      // work as expected.
      if (!newRawHTML.includes(flaw.macroSource)) {
        throw new Error(
          `rawHtml doesn't contain macroSource (${flaw.macroSource})`
        );
      }
      const newMacroSource = flaw.macroSource.replace(
        flaw.redirectInfo.current,
        flaw.redirectInfo.suggested
      );
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
      flaw.fixed = true;
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
    const htmlBefore = newRawHTML;
    newRawHTML = replaceMatchesInText(flaw.href, newRawHTML, flaw.suggestion, {
      inAttribute: "href",
    });
    if (htmlBefore !== newRawHTML) {
      flaw.fixed = true;
    }
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

  if (newRawHTML !== document.rawHtml) {
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
