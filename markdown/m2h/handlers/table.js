const { table: defaultHandler } = require("mdast-util-to-hast/lib/handlers");

/**
 * Wrap tables in scrollable div,
 * to avoid overlap with the sidebar/TOC.
 */
function table(h, node) {
  const attrs = { className: ["table-scroll"] };
  const children = [defaultHandler(h, node)];

  return h(node, "div", attrs, children);
}

module.exports = table;
