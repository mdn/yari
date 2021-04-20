const { packageBCD } = require("../resolve-bcd");

// Bad BCD queries are when the `<div class="bc-data">` tags have an
// ID (or even lack the `id` attribute) that don't match anything in the
// @mdn/browser-compat-data package. E.g. Something like this:
//
//    <div class="bc-data" id="bcd:never.ever.heard.of">

function getBadBCDQueriesFlaws(doc, $) {
  return $("div.bc-data")
    .map((i, element) => {
      const dataQuery = $(element).attr("id");
      if (!dataQuery) {
        return "BCD table without an ID";
      }
      const query = dataQuery.replace(/^bcd:/, "");
      return !packageBCD(query).data && `No BCD data for query: ${query}`;
    })
    .get()
    .filter((explanation) => !!explanation)
    .map((explanation, i) => ({
      id: `bad_bcd_queries${i + 1}`,
      explanation,
      suggestion: null,
    }));
}

module.exports = { getBadBCDQueriesFlaws };
