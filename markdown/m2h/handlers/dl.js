const { all, wrap } = require("./mdast-util-to-hast-utils");

const DEFINITION_PREFIX = ": ";

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
            (paragraph.children[0].value || "").startsWith(DEFINITION_PREFIX)
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
    paragraph.children[0].value = paragraph.children[0].value.slice(
      DEFINITION_PREFIX.length
    );
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

module.exports = { DEFINITION_PREFIX, isDefinitionList, asDefinitionList };
