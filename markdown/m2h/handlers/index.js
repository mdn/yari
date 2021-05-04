const u = require("unist-builder");
const code = require("./code");

function text(node) {
  const data = node.data || {};

  if ("hName" in data || "hProperties" in data || "hChildren" in data) {
    return false;
  }

  return "value" in node;
}

function unknown(h, node) {
  if (text(node)) {
    return h.augment(node, u("text", node.value));
  }

  return h(node, "div", all(h, node));
}

function returnNode(h, node) {
  return node.children ? { ...node, children: all(h, node) } : node;
}

function one(h, node, parent) {
  const type = node && node.type;
  let fn;

  if (!type) {
    throw new Error("Expected node, got `" + node + "`");
  }

  if (type in h.handlers) {
    fn = h.handlers[type];
  } else if (h.passThrough && h.passThrough.includes(type)) {
    fn = returnNode;
  } else {
    fn = h.unknownHandler;
  }

  return (typeof fn === "function" ? fn : unknown)(h, node, parent);
}

function all(h, parent) {
  const nodes = parent.children || [];
  let values = [];
  let result;
  let head;

  for (const node of nodes) {
    result = one(h, node, parent);

    if (result) {
      if (node.type === "break") {
        if (result.type === "text") {
          result.value = result.value.replace(/^\s+/, "");
        }

        if (result.type === "element") {
          head = result.children[0];

          if (head && head.type === "text") {
            head.value = head.value.replace(/^\s+/, "");
          }
        }
      }

      values = values.concat(result);
    }
  }

  return values;
}

module.exports = {
  code,
  paragraph(h, node) {
    const [child] = node.children;
    // Check for an unnecessarily nested KS-tag and unnest it
    if (
      node.children.length == 1 &&
      child.type == "text" &&
      child.value.startsWith("{{") &&
      child.value.endsWith("}}")
    ) {
      return one(h, child, node);
    }

    return h(node, "p", all(h, node));
  },
};
