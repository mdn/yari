import { Handler } from "mdast-util-to-hast";
export const DEFINITION_PREFIX = ": ";

export function isDefinitionList(node) {
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

export function asDefinitionList(state, node): ReturnType<Handler> {
  const children = node.children.flatMap((listItem) => {
    const terms = listItem.children.slice(0, -1);
    const definition =
      listItem.children[listItem.children.length - 1].children[0];
    const [paragraph, ...rest] = definition.children;
    paragraph.children[0].value = paragraph.children[0].value.slice(
      DEFINITION_PREFIX.length
    );

    return [
      {
        type: "element",
        tagName: "dt",
        properties: {},
        children: state.all({
          ...node,
          children:
            terms.length == 1 && terms[0].type == "paragraph"
              ? terms[0].children
              : terms,
        }),
      },
      {
        type: "element",
        tagName: "dd",
        properties: {},
        children: state.all({ ...definition, children: [paragraph, ...rest] }),
      },
    ];
  });

  return {
    type: "element",
    tagName: "dl",
    properties: {},
    children: state.wrap(children, true),
  };
}
