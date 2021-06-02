import { Node } from "unist";

import { handlers } from "./handlers";

import { h, MDNodeUnion } from "./h";
import { InvalidASTError, Options, toPrettyHTML, wrapText } from "./utils";
import { matchesQuery } from "./handlers/utils";

const minify = require("rehype-minify-whitespace");

function transformNode(node, options: Options = {}) {
  const invalid: {
    source: Node;
    targetType: MDNodeUnion["type"];
    unexpectedChildren: MDNodeUnion[];
  }[] = [];
  const unhandled: Node[] = [];

  function transformChildren(node, subOptions: Options = {}) {
    const newOptions = { ...options, ...subOptions };
    if (node.value) {
      return [h("text", wrapText(node.value, newOptions))];
    } else {
      return (Array.isArray(node) ? node : node.children || [])
        .map((child) => {
          const childResult = transformNode(child, newOptions);
          invalid.push(...childResult.invalid);
          unhandled.push(...childResult.unhandled);
          return childResult.transformed;
        })
        .flat();
    }
  }

  let transformed = null;
  const handler = handlers.find(([check]) =>
    matchesQuery(node, check, options)
  );
  if (handler) {
    const handle = handler[1];
    try {
      transformed =
        typeof handle == "string"
          ? h(handle, transformChildren(node), options)
          : handle(node, transformChildren, options);
      if (!transformed) {
        unhandled.push(node);
      }
    } catch (error) {
      if (error instanceof InvalidASTError) {
        invalid.push({
          source: node,
          targetType: error.targetType,
          unexpectedChildren: error.nodes,
        });
      } else {
        throw error;
      }
    }
  } else {
    unhandled.push(node);
  }

  return {
    transformed: transformed || h("html", toPrettyHTML(node)),
    unhandled,
    invalid,
  };
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
