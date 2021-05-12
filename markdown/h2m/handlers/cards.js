const { h } = require("../utils");
const { toText } = require("./to-text");

module.exports = [
  ...["note", "warning"].map((className) => [
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
        toText(grandChild).replace(":", "").toLowerCase() == className
      );
    },
    (node, t) =>
      h(node, "blockquote", [
        h(node, "paragraph", [
          h(node, "strong", [
            h(
              node,
              "text",
              className[0].toUpperCase() + className.slice(1) + ":"
            ),
          ]),
          ...t({ children: node.children[0].children.slice(1) }),
        ]),
        ...t(node.children.slice(1)),
      ]),
  ]),

  [
    (node) =>
      node.tagName == "div" &&
      (node.properties.className || "").includes("callout") &&
      node.children[0].tagName == "h4",
    (node, t) =>
      h(node, "blockquote", [
        h(node, "paragraph", [
          h(node, "strong", [h(node, "text", "Callout:")]),
          h(node, "text", " "),
          h(node, "strong", [h(node, "text", toText(node.children[0]))]),
        ]),
        ...t(node.children.slice(1)),
      ]),
  ],
];
