import { Element } from "hast";

import { MDNodeUnion } from "./h";

export type Options = Partial<{
  shouldWrap: boolean;
  singleLine: boolean;
  summary: string;
}>;

export const asArray = <T>(v: T | T[]) =>
  v ? (Array.isArray(v) ? v : [v]) : [];

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
