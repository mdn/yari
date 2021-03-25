const u = require("unist-builder");

function code(h, node) {
  var value = node.value ? node.value + "\n" : "";
  const lang = node.lang;
  const meta = (node.meta || "").split(" ");
  const props = {};

  if (lang) {
    props.className = ["brush:", lang, ...meta];
  } else if (node.meta) {
    props.className = meta;
  }

  // // Prism will inject a <code> element so we don't.
  // const code = h(node, "code", props, [u("text", value)]);
  // if (node.meta) {
  //   code.data = { meta: node.meta };
  // }
  // return h(node.position, "pre", props, [code]);

  return h(node.position, "pre", props, [u("text", value)]);
}

module.exports = code;
