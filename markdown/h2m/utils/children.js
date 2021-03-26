const { wrapText } = require("../../utils");

const own = {}.hasOwnProperty;

function all(h, parent) {
  const nodes = parent.children || [];
  let values = [];
  let index = -1;
  let result;

  while (++index < nodes.length) {
    result = one(h, nodes[index], parent);

    if (result) {
      values = values.concat(result);
    }
  }

  return values;
}

function one(h, node, parent) {
  let fn;

  if (node.type === "element") {
    if (node.properties && node.properties.dataMdast === "ignore") {
      return;
    }

    if (own.call(h.handlers, node.tagName)) {
      fn = h.handlers[node.tagName];
    }
  } else if (own.call(h.handlers, node.type)) {
    fn = h.handlers[node.type];
  }

  return (typeof fn === "function" ? fn : unknown)(h, node, parent);
}

function unknown(h, node) {
  if (node.value) {
    return h(node, "text", wrapText(h, node.value));
  }

  return all(h, node);
}

module.exports = {
  all,
  one,
};
