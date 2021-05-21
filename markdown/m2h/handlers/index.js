const code = require("./code");
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

function isDefinitionList(node) {
  return (
    !node.ordered &&
    node.children.every((listItem) => {
      if (!listItem.children || listItem.children.length < 2) {
        return false;
      }
      const definitions = listItem.children[listItem.children.length - 1];
      return (
        definitions.type == "list" &&
        definitions.children.length == 1 &&
        definitions.children.every((definition) => {
          const [paragraph] = definition.children || [];
          return (
            paragraph &&
            paragraph.type == "paragraph" &&
            paragraph.children &&
            paragraph.children[0] &&
            (paragraph.children[0].value || "").startsWith(": ")
          );
        })
      );
    })
  );
}

function asDefinitionList(h, node) {
  const children = node.children.flatMap((listItem) => {
    const terms = listItem.children.slice(0, -1);
    const definition =
      listItem.children[listItem.children.length - 1].children[0];
    const [paragraph, ...rest] = definition.children;
    paragraph.children[0].value = paragraph.children[0].value.slice(2); // removes the leading colon
    return [
      h(
        node,
        "dt",
        {},
        all(h, {
          ...node,
          children:
            terms.length == 1 && terms[0].type == "paragraph"
              ? terms[0].children
              : terms,
        })
      ),
      h(
        node,
        "dd",
        {},
        all(h, { ...definition, children: [paragraph, ...rest] })
      ),
    ];
  });
  return h(node, "dl", {}, wrap(children, true));
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
