const { getFirstMatchInText } = require("../matches-in-text");
const escapeHTML = (s) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

function getPreTagFlaws(doc, $, { rawContent }) {
  const flaws = [];

  // Over the years, we've accumulated a lot of Kuma-HTML where the <pre> tags
  // are actually full of HTML. Almost exclusively we've observed <pre> tags whose
  // content is the HTML produced by Prism in the browser. Instead, in these cases,
  // we should just have the code that it will syntax highlight.
  // Note! Having HTML in a <pre> tag is nothing weird or wrong. But if you have
  //
  //  <pre class="language-js">
  //    <code class="language-js">
  //     <span class="keyword">foo</span>
  //   </code>
  //  </pre>
  //
  // It's better just have the text itself inside the <pre> block:
  //  <pre class="language-js">
  //    foo
  //  </pre>
  //
  // This makes it easier to edit the code in raw form. It also makes it less
  // heavy because any HTML will be replaced with Prism HTML anyway.
  function addCodeTagFlaw($pre) {
    const id = `bad_pre_tags${flaws.length + 1}`;
    const type = "pre_with_html";
    const explanation = `<pre><code>CODE can be just <pre>CODE`;
    const suggestion = escapeHTML($pre.text());

    let fixable = false;
    let html = $pre.html();
    if (rawContent.includes(html)) {
      fixable = true;
    } else {
      // Many times, the HTML found in the sources is what Cheerio would
      // serialize as HTML but with the small difference that some entities
      // are unnecessarily HTML encoded as entities. So, we try to ignore
      // that and see if we can match it as serialized.
      const htmlFixed = html.replace(/&apos;/g, "'");
      if (rawContent.includes(htmlFixed)) {
        html = htmlFixed;
        fixable = true;
      }
    }

    const flaw = { explanation, id, fixable, html, suggestion, type };
    if (fixable) {
      // Only if it's fixable, is the `html` perfectly findable in the raw content.
      const { line, column } = getFirstMatchInText(html, rawContent);
      flaw.line = line;
      flaw.column = column;
    }

    // Actually mutate the cheerio instance so we benefit from the
    // flaw detection immediately.
    // Note that `$pre.text()` might contain unescaped HTML, but Cheerio will
    // take care of that.
    $pre.html(suggestion); // strips all other HTML but preserves whitespace
    $pre.attr("data-flaw", id);

    flaws.push(flaw);
  }

  // Matches all <code> that are preceded by
  // a <pre class="...brush...">
  // Note, when we (in Node) syntax highlight code, the first thing
  // we look for is the `$("pre[class*=brush]")` selector.
  // Note, in jQuery you can do `$("pre + code")` which means it only selects
  // the `<code>` tags that are *immediately preceeding*. This is not supported
  // in Cheerio :( but the `>` operator works. And since we're only looking
  // at a specific classname on the <pre> the chances of picking up the wrong
  // selectors is small.
  $("pre[class*=brush] > code").each((i, element) => {
    const $pre = $(element).parent();
    // Because Cheerio doesn't support selectors like `pre + code` we have to
    // manually (double) check that the parent really is a `<pre>` tag.
    if ($pre.length && $pre.get(0).tagName === "pre") {
      addCodeTagFlaw($pre);
    }
  });

  // TODO: Add other <pre> tag flaws underneath.
  // We report only a single kind of fixable flaw at a time, since
  // flaws are fixed by replacing raw HTML strings (so fixing the first
  // fixable flaw might prevent fixing the second fixable flaw)
  // For details see:
  //   https://github.com/mdn/yari/pull/2144#issuecomment-748346489
  //
  // Also, make sure iterate over the document synchroneously,
  // e.g., with $().each(), or await for all Promises before moving on to the next flaw.
  if (flaws.some((flaw) => !flaw.fixable)) {
    // one more flaw check here
  }

  return flaws;
}

module.exports = { getPreTagFlaws };
