const { h } = require("../utils");
const { toText } = require("./to-text");

const classToLabel = (name) => name[0].toUpperCase() + name.slice(1) + ":";

module.exports = ["note", "warning"].map((className) => [
  (node) => {
    if (!(node.properties.className || []).some((c) => c == className)) {
      return false;
    }
    if (!node.children || !node.children[0]) {
      return false;
    }
    const [child] = node.children;
    if (!child.children || !child.children[0]) {
      return false;
    }
    const grandChild = child.children[0];
    return (
      grandChild.tagName == "strong" &&
      toText(grandChild) == classToLabel(className)
    );
  },
  (node, t) =>
    h(node, "blockquote", [
      h(node, "paragraph", [
        h(node, "strong", [h(node, "text", classToLabel(className))]),
        ...t({ children: node.children[0].children.slice(1) }),
      ]),
      h(node, "paragraph", t(node.children.slice(1))),
    ]),
]);
