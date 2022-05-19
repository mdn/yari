const u = require("unist-builder");

/**
 * Transform a markdown code block into a <pre>.
 * Adding the highlight tags as classes prefixed by "brush:"
 */
function code(h, node) {
  var value = node.value ? node.value + "\n" : "";
  const lang = node.lang;
  const meta = (node.meta || "").split(" ");
  const props = {};

  if (lang) {
    props.className = ["brush:", lang.toLowerCase(), ...meta];
  } else if (node.meta) {
    props.className = meta;
  }

  /*
   * Prism will inject a <code> element so we don't.
   * If we wanna change this uncomment the following code:
   */
  // const code = h(node, "code", props, [u("text", value)]);
  // if (node.meta) {
  //   code.data = { meta: node.meta };
  // }
  // return h(node.position, "pre", props, [code]);

  return h(node.position, "pre", props, [u("text", value)]);
}

module.exports = code;
