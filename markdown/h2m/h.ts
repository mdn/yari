import type {
  BlockContent,
  Content,
  DefinitionContent,
  FrontmatterContent,
  ListContent,
  PhrasingContent,
  Root,
  RowContent,
  StaticPhrasingContent,
  TableContent,
  TopLevelContent,
} from "mdast";
import { asArray, InvalidASTError } from "./utils";

export type MDNodeUnion =
  | Root
  | FrontmatterContent
  | BlockContent
  | DefinitionContent
  | ListContent
  | TableContent
  | RowContent
  | PhrasingContent;

export type MDNode<Type> = Extract<MDNodeUnion, { type: Type }>;

const STATIC_PHRASING_CONTENT: StaticPhrasingContent["type"][] = [
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

const PHRASING_CONTENT: PhrasingContent["type"][] = [
  ...STATIC_PHRASING_CONTENT,
  "link",
  "linkReference",
];

const BLOCK_CONTENT: BlockContent["type"][] = [
  "paragraph",
  "heading",
  "thematicBreak",
  "blockquote",
  "list",
  "table",
  "html",
  "code",
];

const TOP_LEVEL_CONTENT: TopLevelContent["type"][] = [...BLOCK_CONTENT];

const CONTENT: Content["type"][] = [
  ...TOP_LEVEL_CONTENT,
  "listItem",
  "tableRow",
  "tableCell",
  ...PHRASING_CONTENT,
];

type MDNodesWithChildren = Extract<MDNodeUnion, { children: unknown[] }>;

const CHILDREN_TYPES: Partial<
  {
    [Type in MDNodesWithChildren["type"]]: Extract<
      MDNodesWithChildren,
      { type: Type }
    >["children"][0]["type"][];
  }
> = {
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

function assertCorrectChildren<Type extends MDNodesWithChildren["type"]>(
  type: Type,
  children: MDNodeUnion[]
): asserts children is Extract<
  MDNodesWithChildren,
  { type: Type }
>["children"] {
  const childrenTypes = type in CHILDREN_TYPES ? CHILDREN_TYPES[type] : CONTENT;
  const unexpectedChildren = children.filter(
    (child) => !childrenTypes.includes(child.type as any)
  );
  if (unexpectedChildren.length > 0) {
    throw new InvalidASTError(type, unexpectedChildren);
  }
}

export function h<Type extends MDNodeUnion["type"], Node extends MDNode<Type>>(
  type: Type,
  childrenOrValue?: string | MDNodeUnion[] | MDNodeUnion,
  props?: Omit<Node, "type" | "children" | "value">
): MDNode<Type> {
  const mdNode = { type, ...props };
  if (typeof childrenOrValue === "string") {
    return { ...mdNode, value: childrenOrValue } as any;
  } else if (childrenOrValue) {
    const children = asArray(childrenOrValue);
    assertCorrectChildren(type as any, children);
    return { ...mdNode, children } as any;
  } else {
    return mdNode as any;
  }
}
