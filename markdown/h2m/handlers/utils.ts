import { Comment, Element, Text } from "hast";
import { MDNodeUnion } from "../h";
import { asArray, Options, toSelector } from "../utils";

type OneOrMany<T> = T | [T, ...T[]];

type AttributeValue = string | number | boolean | (string | number)[];
type AttributeQuery = OneOrMany<string | object>;

type OptionalClassQuery = OneOrMany<string | ((str: string) => boolean)>;

export type Query = OneOrMany<
  | string
  | Partial<{
      is: string | string[];

      has: AttributeQuery;
      canHave: AttributeQuery;

      hasClass: OneOrMany<string>;
      canHaveClass: OptionalClassQuery;
    }>
  | ((node: Element, options: Options) => boolean | Query)
>;

type HTMLNode = Element | Comment | Text;

type Transform =
  | MDNodeUnion["type"]
  | ((
      node: Element,
      t: (node: HTMLNode | HTMLNode[], subOptions?: Options) => MDNodeUnion[],
      options: Options
    ) => null | MDNodeUnion | MDNodeUnion[]);

export type QueryAndTransform = readonly [Query, Transform];

const exhaustsProps = (
  props: Record<string, AttributeValue>,
  required: undefined | AttributeQuery,
  optional: undefined | AttributeQuery
) => {
  const remaining = new Map(
    Object.entries(props).map(([key, value]) => [key, new Set(asArray(value))])
  );
  for (const keyOrObject of asArray(required)) {
    if (typeof keyOrObject == "object") {
      for (const [key, value] of Object.entries(keyOrObject)) {
        const valueSet = remaining.get(key);
        if (!valueSet || !valueSet.delete(value)) {
          return false;
        }
        if (valueSet && valueSet.size == 0) {
          remaining.delete(key);
        }
      }
    } else {
      if (!remaining.delete(keyOrObject)) {
        return false;
      }
    }
  }
  for (const keyOrObject of asArray(optional)) {
    if (typeof keyOrObject == "object") {
      for (const [key, value] of Object.entries(keyOrObject)) {
        const valueSet = remaining.get(key);
        if (valueSet) {
          valueSet.delete(value);
          if (valueSet.size == 0) {
            remaining.delete(key);
          }
        }
      }
    } else {
      remaining.delete(keyOrObject);
    }
  }
  return remaining.size == 0;
};

const exhaustsClasses = (
  classes: string[],
  required: undefined | string[],
  optional: undefined | OptionalClassQuery
) => {
  const remaining = new Set(classes);
  for (const key of asArray(required)) {
    if (!remaining.delete(key)) {
      return false;
    }
  }
  for (const key of asArray(optional)) {
    if (typeof key == "function") {
      const matches = Array.from(remaining).filter((k) => key(k));
      for (const match of matches) {
        remaining.delete(match);
      }
    } else {
      remaining.delete(key);
    }
  }
  return remaining.size == 0;
};

export const matchesQuery = (
  node: Element,
  query: Query,
  options: Options = {}
) => {
  if (Array.isArray(query)) {
    return query.some((q) => matchesQuery(node, q, options));
  }

  if (typeof query == "function") {
    const result = query(node, options);
    return typeof result == "boolean"
      ? result
      : matchesQuery(node, result, options);
  }

  if (node.type !== "element") {
    return false;
  }

  if (typeof query == "string") {
    return query == toSelector(node);
  }

  if (typeof query !== "object") {
    return false;
  }

  if (
    "is" in query &&
    !asArray(query.is).some((tagName) => node.tagName == tagName)
  ) {
    return false;
  }

  const { className, ...props } = node.properties;
  return (
    exhaustsProps(props, query.has, query.canHave) &&
    exhaustsClasses(
      asArray(className) as string[],
      asArray(query.hasClass),
      query.canHaveClass
    )
  );
};
