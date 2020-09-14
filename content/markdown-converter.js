const unified = require("unified");
const parse = require("remark-parse");
const stringify = require("rehype-stringify");
const remark2rehype = require("remark-rehype");
const raw = require("rehype-raw");

/**
 * Converts Markdown -> HTML using unified.
 * Using `raw` enables us to process HTML embedded in the Markdown.
 */
function markdownToHTML(md) {
  return unified()
    .use(parse)
    .use(remark2rehype, { allowDangerousHtml: true })
    .use(raw)
    .use(stringify)
    .processSync(md)
    .toString();
}

module.exports = {
  markdownToHTML,
};
