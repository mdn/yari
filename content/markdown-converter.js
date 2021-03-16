const unified = require("unified");
const parse = require("remark-parse");
const stringify = require("rehype-stringify");
const remark2rehype = require("remark-rehype");
const raw = require("rehype-raw");
const visit = require("unist-util-visit");

/**
 * Converts Markdown -> HTML using unified.
 * Using `raw` enables us to process HTML embedded in the Markdown.
 */
function markdownToHTML(md) {
  return unified()
    .use(parse)
    .use(remark2rehype, { allowDangerousHtml: true })
    .use(remarkCodeBlocks)
    .use(raw)
    .use(stringify)
    .processSync(md)
    .toString();
}

function remarkCodeBlocks(options) {
  options = options || {};

  return (tree) => {
    visit(tree, "element", visitor);
  };

  function visitor(node, index, parent) {
    if (!parent || parent.tagName !== "pre" || node.tagName !== "code") {
      return;
    }
    // When you use the triple-backtick and a language, like...
    //
    //    ```css
    //    ...
    //
    // What you get is:
    //
    //    <pre><code class="language-css">...
    //
    // Let's now convert that to:
    //
    //    <pre class="brush: css">
    //
    // The reason for doing this is entirely to pretend that nothing has changed.
    // This way, the Markdown gets converted to HTML in the way Yari can process
    // all other existing HTML.

    const classNames = node.properties.className || [];
    for (const className of classNames) {
      if (className.startsWith("language-")) {
        const classNamesBefore = parent.properties.className || [];
        parent.properties.className = [
          `brush: ${className.replace("language-", "").toLowerCase()}`,
          ...classNamesBefore,
        ];
      }
    }
  }
}

module.exports = {
  markdownToHTML,
};
