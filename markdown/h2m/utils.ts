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
  const source = toHTML(...args);

  // Prettier often breaks starting tags but that does not seem to be an issue for
  // our <table> tags for which we are mainly interested in prettier HTML, hence
  // we only prettify those.
  if (!source.startsWith("<table")) {
    return source;
  }

  return prettier
    .format(source, {
      semi: false,
      parser: "html",
    })
    .trim();
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
