import { asArray, InvalidASTError } from "./utils.js";

const STATIC_PHRASING_CONTENT = [
  "text",
  "emphasis",
  "strong",
  "delete",
  "html",
  "inlineCode",
  "break",
  "image",
  "imageReference",
  "footnote",
  "footnoteReference",
];

const PHRASING_CONTENT = [...STATIC_PHRASING_CONTENT, "link", "linkReference"];

const BLOCK_CONTENT = [
  "paragraph",
  "heading",
  "thematicBreak",
  "blockquote",
  "list",
  "table",
  "html",
  "code",
];

const TOP_LEVEL_CONTENT = [...BLOCK_CONTENT];

const CONTENT = [
  ...TOP_LEVEL_CONTENT,
  "listItem",
  "tableRow",
  "tableCell",
  ...PHRASING_CONTENT,
];

const CHILDREN_TYPES = {
  paragraph: PHRASING_CONTENT,
  heading: PHRASING_CONTENT,
  blockquote: BLOCK_CONTENT,
  list: ["listItem"],
  listItem: BLOCK_CONTENT,
  table: ["tableRow"],
  tableRow: ["tableCell"],
  tableCell: PHRASING_CONTENT,
  footnoteDefinition: BLOCK_CONTENT,
  emphasis: PHRASING_CONTENT,
  strong: PHRASING_CONTENT,
  delete: PHRASING_CONTENT,
  link: STATIC_PHRASING_CONTENT,
  linkReference: STATIC_PHRASING_CONTENT,
  footnote: PHRASING_CONTENT,
};

export const isBlockContent = (node) => BLOCK_CONTENT.includes(node.type);

function assertCorrectChildren(type, children) {
  const childrenTypes = type in CHILDREN_TYPES ? CHILDREN_TYPES[type] : CONTENT;
  const unexpectedChildren = children.filter(
    (child) => !childrenTypes.includes(child.type)
  );
  if (unexpectedChildren.length > 0) {
    throw new InvalidASTError(type, unexpectedChildren);
  }
}

export function h(type, childrenOrValue, props) {
  const mdNode = { type, ...props };
  if (typeof childrenOrValue === "string") {
    return { ...mdNode, value: childrenOrValue };
  } else if (childrenOrValue) {
    const children = asArray(childrenOrValue);
    assertCorrectChildren(type, children);
    return { ...mdNode, children };
  } else {
    return mdNode;
  }
}
