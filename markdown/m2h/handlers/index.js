const code = require("./code");
const { asDefinitionList, isDefinitionList } = require("./dl");
const { one, all, wrap } = require("./mdast-util-to-hast-utils");

function getNotecardType(node) {
  if (!node.children) {
    return null;
  }
  const [child] = node.children;
  if (!child || !child.children) {
    return null;
  }
  const [grandChild] = child.children;
  if (grandChild.type != "strong" || !grandChild.children) {
    return null;
  }
  const type = grandChild.children[0].value.replace(":", "").toLowerCase();
  return type == "warning" || type == "note" || type == "callout" ? type : null;
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

  blockquote(h, node) {
    const type = getNotecardType(node);
    if (type) {
      const isCallout = type == "callout";
      if (isCallout) {
        node.children[0].children.splice(0, 1);
      }
      return h(
        node,
        "div",
        { className: isCallout ? [type] : ["notecard", type] },
        wrap(all(h, node), true)
      );
    }
    return h(node, "blockquote", wrap(all(h, node), true));
  },

  list(h, node) {
    if (isDefinitionList(node)) {
      return asDefinitionList(h, node);
    }

    const name = node.ordered ? "ol" : "ul";

    const props = {};
    if (typeof node.start === "number" && node.start !== 1) {
      props.start = node.start;
    }

    // This removes directly descendent paragraphs
    const items = all(h, node).map((item) => ({
      ...item,
      children: item.children.flatMap((child) =>
        child.tagName == "p" ? child.children : [child]
      ),
    }));

    return h(node, name, props, wrap(items, true));
  },
};
