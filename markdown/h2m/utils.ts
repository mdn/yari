import { Element } from "hast";
import * as toHTML from "hast-util-to-html";
import * as prettier from "prettier";

import { MDNodeUnion } from "./h";

export type Options = Partial<{
  rowIndex: number;
  shouldWrap: boolean;
  singleLine: boolean;
  summary: string;
}>;

export const asArray = <T extends undefined | unknown | unknown[]>(
  v: T | T[]
): T[] => (v ? (Array.isArray(v) ? v : [v]) : []);

export const wrapText = (value, { shouldWrap }: Options) =>
  shouldWrap ? value.replace(/\r?\n|\r/g, " ") : value;

export class InvalidASTError extends Error {
  targetType: MDNodeUnion["type"];
  nodes: MDNodeUnion[];

  constructor(targetType: MDNodeUnion["type"], nodes: MDNodeUnion[]) {
    super("invalid AST due to unexpected children");
    this.targetType = targetType;
    this.nodes = nodes;
  }
}

export const toPrettyHTML = (...args: Parameters<typeof toHTML>) => {
  const result = prettier.format(toHTML(...args), {
    semi: false,
    parser: "html",
  });
  // Workaround for Prettier issue https://github.com/prettier/prettier/issues/10950
  if (result.endsWith("\n>\n")) {
    return result.slice(0, -3) + ">";
  }
  return result;
};

export const toSelector = ({
  tagName,
  properties: { id, className, ...rest },
}: Element) => {
  const classList = asArray(className);
  return [
    tagName,
    id ? "#" + id : "",
    classList.length > 0 ? "." + classList.join(".") : "",
    Object.entries(rest)
      .map(([key, value]) => `[${key}${value === "" ? "" : `="${value}"`}]`)
      .join(""),
  ].join("");
};
