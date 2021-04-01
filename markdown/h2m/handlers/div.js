const toHtml = require("hast-util-to-html");
const { all } = require("../utils/children");

/**
 * Keeping a <div> as raw HTML with all attributes.
 *
 * ```css hidden
 * ...
 * ```
 * becomes
 * <pre class="brush: css hidden">...</pre>
 */
function div(h, node) {
  if (!node.children) {
    return h(node, "html", toHtml(node));
  }
  return [
    h(node, "html", toHtml({ ...node, children: null }, { voids: ["div"] })),
    ...all(h, node),
    h(node, "html", "</div>"),
  ];
}

module.exports = div;
