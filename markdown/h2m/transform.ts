import * as toHTML from "hast-util-to-html";
import { Element } from "hast";
import { handlers } from "./handlers";

import { h } from "./h";
import { asArray, Options, UnexpectedNodesError, wrapText } from "./utils";
import { Query } from "./handlers/utils";

const minify = require("rehype-minify-whitespace");

const toSelector = ({
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

const matchesQuery = (node: Element, check: Query) => {
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

function transformNode(node, options: Options = {}) {
  const selector = node.type === "element" && toSelector(node);
  const unhandled = [];

  function transformChildren(node, subOptions: Options = {}) {
    const newOptions = { ...options, ...subOptions };
    if (node.value) {
      return [h("text", wrapText(node.value, newOptions))];
    } else {
      return (Array.isArray(node) ? node : node.children || [])
        .map((child) => {
          const [transformed, childUnhandled] = transformNode(
            child,
            newOptions
          );
          unhandled.push(...childUnhandled);
          return transformed;
        })
        .flat();
    }
  }

  let transformed = null;
  const handler = handlers.find(([check]) => matchesQuery(node, check));
  if (handler) {
    const handle = handler[1];
    try {
      transformed =
        typeof handle == "string"
          ? h(handle, transformChildren(node), options)
          : handle(node, transformChildren, options);
    } catch (error) {
      if (error instanceof UnexpectedNodesError) {
        unhandled.push(
          ...error.nodes.map((node) =>
            node.type == "element"
              ? toSelector(node as Element)
              : JSON.stringify(node)
          )
        );
      } else {
        console.error("error while handling", node, ":", error);
      }
    }
  } else if (selector) {
    unhandled.push(selector);
  }

  return [transformed || h("html", toHTML(node)), unhandled];
}

function toMdast(tree, options) {
  minify({ newlines: true })(tree);
  return transformNode(tree, options);
}

// If a destination is given, runs the destination with the new mdast tree
// (bridge-mode).
// Without destination, returns the mdast tree: further plugins run on that tree
// (mutate-mode).
export function transform(destination, options = null) {
  if (destination && !destination.process && !options) {
    options = destination;
    destination = null;
  }

  return destination
    ? function transformer(node, file, next) {
        destination.run(toMdast(node, options), file, (err) => next(err));
      }
    : (node) => toMdast(node, options);
}
