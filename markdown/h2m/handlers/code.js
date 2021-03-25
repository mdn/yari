const convert = require("hast-util-is-element/convert");
const toText = require("hast-util-to-text");
const trim = require("trim-trailing-lines");
const wrapText = require("../utils/wrap");

const pre = convert("pre");

function code(h, node) {
  let lang;
  let meta;

  if (pre(node)) {
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
    trim(wrapText(h, toText(node)))
  );
}

module.exports = code;
