const FLAW_LEVELS = Object.freeze({
  WARN: "warn",
  IGNORE: "ignore",
  ERROR: "error",
});

/**
 * Validate the parsed HTML, with the sidebar removed.
 *
 * @param {Object} doc
 * @param {Cheerio document instance} $
 */
function injectFlaws( doc, $) {
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
        if (!Document.read(href.toLowerCase())) {
          if (!("broken_links" in doc.flaws)) {
            doc.flaws.broken_links = [];
          }
          doc.flaws.broken_links.push(href);
        }
      }
    });
    if (this.options.flawLevels.get("broken_links") === FLAW_LEVELS.ERROR) {
      throw new Error(`broken_links flaws: ${doc.flaws.broken_links}`);
    }
  }

  if (this.options.flawLevels.get("bad_bcd_queries") !== FLAW_LEVELS.IGNORE) {
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
    if (this.options.flawLevels.get("bad_bcd_queries") === FLAW_LEVELS.ERROR) {
      throw new Error(`bad_bcd_queries flaws: ${doc.flaws.bad_bcd_queries}`);
    }
  }
}
