const { findMatchesInText } = require("../matches-in-text");

// You're not allowed to have `<a>` elements inside `<h2>` or `<h3>` elements
// because those will be rendered out as "links to themselves".
// I.e. a source of `<h2 id="foo">Foo</h2>` renders out as:
// `<h2 id="foo"><a href="#foo">Foo</a></h2>` in the final HTML. That makes
// it easy to (perma)link to specific headings in the document.
function getHeadingLinksFlaws(doc, $, { rawContent }) {
  const flaws = [];

  $("h2 a, h3 a").each((i, element) => {
    const id = `heading_links${flaws.length + 1}`;
    const explanation = `${
      $(element).parent().get(0).tagName
    } heading contains an <a> tag`;
    const before = $(element).parent().html();
    let suggestion = null;
    // If the only element within the heading's HTML is 1 single <a>
    // then, we can simply replace the whole heading's HTML with the text of it.
    if (
      $("a", $(element).parent()).length === 1 &&
      $("*", $(element).parent()).length === 1
    ) {
      suggestion = $(element).parent().text();
    }
    let line = null;
    let column = null;
    // If the heading has an ID we can search for it in the rawContent.
    for (const { line: foundLine, column: foundColumn } of findMatchesInText(
      before,
      rawContent
    )) {
      line = foundLine;
      column = foundColumn;
      // This makes sure the column is *after* the ID value (plus quotation mark)
      if ($(element).parent().attr("id")) {
        column += $(element).parent().attr("id").length + 2;
      }
    }
    // It's never fixable because it's too hard to find in the raw HTML.
    const fixable = false;
    const html = $.html($(element).parent());
    const flaw = {
      explanation,
      id,
      before,
      fixable,
      html,
      suggestion,
      line,
      column,
    };
    if (suggestion) {
      $(element).parent().html(suggestion);
    }
    flaws.push(flaw);
  });

  return flaws;
}

module.exports = { getHeadingLinksFlaws };
