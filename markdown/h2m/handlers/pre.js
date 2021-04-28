const convert = require("hast-util-is-element/convert");
const toText = require("hast-util-to-text");

const { wrapText, trimTrailingNewLines } = require("../../utils");

const isPre = convert("pre");

/**
 * Converting a <pre> tag into a markdown code block.
 * We transform the class name into highlight tags.
 *
 * <pre class="brush: css hidden">...</pre>
 * becomes
 * ```css hidden
 * ...
 * ```
 */
function pre(h, node) {
  let lang;
  let meta;

  if (isPre(node)) {
    const metaList = [];
    const classList = node.properties.className;
    if (classList) {
      const brush = classList.findIndex((e) => e === "brush:");

      if (brush > -1 && classList.length > brush + 1) {
        lang = classList[brush + 1];
        metaList.push(...classList.slice(0, brush));
        metaList.push(...classList.slice(brush + 2));
      } else {
        metaList.push(...classList);
      }
    }
    meta = metaList.join(" ");
  }

  return h(
    node,
    "code",
    { lang: lang || null, meta: meta || null },
    trimTrailingNewLines(wrapText(h, toText(node)))
  );
}

module.exports = pre;
