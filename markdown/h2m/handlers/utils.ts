import { Comment, Element, Text } from "hast";
import { MDNodeUnion } from "../h";
import { asArray, Options, toSelector } from "../utils";

export type Query =
  | string
  | [string, string, ...string[]]
  | Partial<{
      is: string | string[];
      has: string | string[];
      canHave: string | string[];
      hasClass: string | string[];
      canHaveClass: string | string[];
    }>
  | ((node: Element) => boolean);

type HTMLNode = Element | Comment | Text;

type Transform =
  | MDNodeUnion["type"]
  | ((
      node: Element,
      t: (node: HTMLNode | HTMLNode[], subOptions?: Options) => MDNodeUnion[],
      options: Options
    ) => null | MDNodeUnion | MDNodeUnion[]);

export type QueryAndTransform = readonly [Query, Transform];

const isExhaustive = (
  source: string[],
  required: undefined | string | string[],
  optional: undefined | string | string[] | ((str: string) => boolean)
) => {
  const sourceSet = new Set(source);
  for (const key of asArray(required)) {
    if (!sourceSet.delete(key)) {
      return false;
    }
  }
  for (const key of asArray(optional)) {
    if (typeof key == "function") {
      const matches = Array.from(sourceSet).filter((k) => key(k));
      for (const match of matches) {
        sourceSet.delete(match);
      }
    } else {
      sourceSet.delete(key);
    }
  }
  return sourceSet.size == 0;
};

export const matchesQuery = (node: Element, check: Query) => {
  if (typeof check == "function") {
    return check(node);
  }

  if (node.type !== "element") {
    return false;
  }

  if (Array.isArray(check) || typeof check == "string") {
    return asArray(check).includes(toSelector(node));
  }

  if (typeof check !== "object") {
    return false;
  }

  if (
    "is" in check &&
    !asArray(check.is).some((tagName) => node.tagName == tagName)
  ) {
    return false;
  }

  const { className, ...props } = node.properties;
  return (
    isExhaustive(Object.keys(props), check.has, check.canHave) &&
    isExhaustive(
      asArray(className) as string[],
      check.hasClass,
      check.canHaveClass
    )
  );
};
