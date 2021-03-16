const unified = require("unified");
const parse = require("remark-parse");
const stringify = require("rehype-stringify");
const remark2rehype = require("remark-rehype");
const raw = require("rehype-raw");
const visit = require("unist-util-visit");
const nodeToString = require("hast-util-to-string");
const refractor = require("refractor");

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

    const lang = getLanguage(node);

    if (lang === null) {
      return;
    }

    let result;
    try {
      parent.properties.className = (parent.properties.className || []).concat(
        "language-" + lang
      );
      result = refractor.highlight(nodeToString(node), lang);
    } catch (err) {
      if (options.ignoreMissing && /Unknown language/.test(err.message)) {
        return;
      }
      throw err;
    }

    node.children = result;
  }
}

function getLanguage(node) {
  const className = node.properties.className || [];

  for (const classListItem of className) {
    if (classListItem.slice(0, 9) === "language-") {
      return classListItem.slice(9).toLowerCase();
    }
  }

  return null;
}

module.exports = {
  markdownToHTML,
};
