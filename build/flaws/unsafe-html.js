const {
  INTERACTIVE_EXAMPLES_BASE_URL,
  LIVE_SAMPLES_BASE_URL,
} = require("../../kumascript/src/constants");
const { findMatchesInText } = require("../matches-in-text");

const safeIFrameSrcs = [
  // EmbedGHLiveSample.ejs
  "https://mdn.github.io",
  // EmbedYouTube.ejs
  "https://www.youtube-nocookie.com",
  // JSFiddleEmbed.ejs
  "https://jsfiddle.net",
  // EmbedTest262ReportResultsTable.ejs
  "https://test262.report",
];
if (LIVE_SAMPLES_BASE_URL) {
  safeIFrameSrcs.push(LIVE_SAMPLES_BASE_URL.toLowerCase());
}
if (INTERACTIVE_EXAMPLES_BASE_URL) {
  safeIFrameSrcs.push(INTERACTIVE_EXAMPLES_BASE_URL.toLowerCase());
}

function getAndMarkupUnsafeHTMLFlaws(doc, $, { rawContent, fileInfo }) {
  const flaws = [];

  function addFlaw(element, explanation) {
    const id = `unsafe_html${flaws.length + 1}`;
    let html = $.html($(element));
    $(element).replaceWith($("<code>").addClass("unsafe-html").text(html));
    // Some nasty tags are so broken they can make the HTML become more or less
    // the whole page. E.g. `<script\x20type="text/javascript">`.
    if (html.length > 100) {
      html = html.slice(0, Math.min(html.indexOf("\n"), 100)) + "…";
    }
    // Perhaps in the future we can make it possibly fixable to delete it.
    const fixable = false;
    const suggestion = null;

    const flaw = {
      explanation,
      id,
      fixable,
      html,
      suggestion,
    };
    for (const { line, column } of findMatchesInText(html, rawContent)) {
      // This might not find anything because the HTML might have mutated
      // slightly because of how cheerio parses it. But it doesn't hurt to try.
      flaw.line = line;
      flaw.column = column;
    }

    flaws.push(flaw);
  }

  $("script, embed, object, iframe, style").each((i, element) => {
    const { tagName } = element;
    if (tagName === "iframe") {
      // For iframes we only check the 'src' value
      const src = $(element).attr("src");
      if (!src) {
        console.warn(
          `${fileInfo.path} has an iframe without a 'src' attribute`
        );
        return;
      }
      // Local URLs are always safe.
      if (!(src.startsWith("//") || src.includes("://"))) {
        return;
      }
      if (!safeIFrameSrcs.find((s) => src.toLowerCase().startsWith(s))) {
        addFlaw(element, `Unsafe <iframe> 'src' value (${src})`);
      }
    } else {
      addFlaw(element, `<${tagName}> tag found`);
    }
  });

  $("*").each((i, element) => {
    const { tagName } = element;
    // E.g. `<script\x20type="text/javascript">javascript:alert(1);</script>`
    if (tagName.startsWith("script")) {
      addFlaw(element, `possible <script> tag`);
    }

    const checkValueAttributes = new Set(["style", "href"]);
    for (const key in element.attribs) {
      // No need to lowercase the `key` because it's already always lowercased
      // by cheerio.
      // This regex will match on `\xa0onload` and `onmousover` but
      // not `fond` or `stompon`.
      if (/(\\x[a-f0-9]{2}|\b)on\w+/.test(key)) {
        addFlaw(element, `'${key}' on-handler found in ${tagName}`);
      } else if (checkValueAttributes.has(key)) {
        const value = element.attribs[key];
        if (value && /(^|\\x[a-f0-9]{2})javascript:/i.test(value)) {
          addFlaw(
            element,
            `'javascript:' expression found inside 'style' attribute in ${tagName}`
          );
        }
      }
    }
  });

  return flaws;
}

module.exports = { getUnsafeHTMLFlaws: getAndMarkupUnsafeHTMLFlaws };
