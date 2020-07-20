const { Document } = require("content");

const { FLAW_LEVELS } = require("./constants");
const { packageBCD } = require("./resolve-bcd");

const options = { flawLevels: new Map() };

/**
 * Validate the parsed HTML, with the sidebar removed.
 */
function injectFlaws(doc, $) {
  // The 'broken_links' flaw check looks for internal links that
  // link to a document that's going to fail with a 404 Not Found.
  if (options.flawLevels.get("broken_links") !== FLAW_LEVELS.IGNORE) {
    // This is needed because the same href can occur multiple time.
    // Especially when there's...
    //    <a href="/foo/bar#one">
    //    <a href="/foo/bar#two">
    const checked = new Set();

    $("a[href]").each((i, element) => {
      const a = $(element);
      const href = a.attr("href").split("#")[0];
      if (href.startsWith("/") && !checked.has(href)) {
        checked.add(href);
        if (!Document.findByURL(href.toLowerCase())) {
          if (!("broken_links" in doc.flaws)) {
            doc.flaws.broken_links = [];
          }
          doc.flaws.broken_links.push(href);
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
    if (options.flawLevels.get("bad_bcd_queries") === FLAW_LEVELS.ERROR) {
      throw new Error(`bad_bcd_queries flaws: ${doc.flaws.bad_bcd_queries}`);
    }
  }
}

module.exports = { injectFlaws };
