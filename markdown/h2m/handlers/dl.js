import { DEFINITION_PREFIX } from "../../m2h/handlers/dl.js";
import { h, isBlockContent } from "../h.js";

const DEFINITION_START = h("text", DEFINITION_PREFIX);

const wrapNonBlocks = (nodes) => {
  let openParagraph = null;
  const result = [];
  for (const node of nodes) {
    if (isBlockContent(node)) {
      if (openParagraph) {
        result.push(openParagraph);
        openParagraph = null;
      }
      result.push(node);
    } else {
      openParagraph = h("paragraph", []);
      openParagraph.children.push(node);
    }
  }
  if (openParagraph) {
    result.push(openParagraph);
  }
  return result;
};

function prefixDefinitions([first, ...rest]) {
  if (!first) {
    return h("text", "");
  }

  switch (first.type) {
    case "paragraph":
      return wrapNonBlocks([
        { ...first, children: [DEFINITION_START, ...first.children] },
        ...rest,
      ]);

    case "text":
      return wrapNonBlocks([
        { ...first, value: DEFINITION_PREFIX + first.value },
        ...rest,
      ]);

    default:
      return h("paragraph", [DEFINITION_START, first, ...rest]);
  }
}

const toDefinitionItem = (node, terms, definitions) =>
  h(
    "listItem",
    [
      ...terms,
      h(
        "list",
        h("listItem", prefixDefinitions(definitions), { spread: true }),
        {
          spread: false,
        }
      ),
    ],
    { spread: false }
  );

export const dl = [
  "dl",
  (node, t) => {
    const children = [];
    let terms = [];
    for (const child of node.children) {
      if (child.tagName == "dt") {
        terms.push(h("paragraph", t(child)));
      } else if (child.tagName == "dd" && terms.length > 0) {
        children.push(toDefinitionItem(node, terms, t(child)));
        terms = [];
      } else {
        return null;
      }
    }
    return terms.length == 0 ? h("list", children, { spread: false }) : null;
  },
];
