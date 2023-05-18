/*
These functions are more-or-less verbatim from https://github.com/syntax-tree/mdast-util-to-hast
Unfortunately the module was not exporting them, so they needed to be copied.
 */

import { u } from "unist-builder";

function text(node) {
  const data = node.data || {};

  if ("hName" in data || "hProperties" in data || "hChildren" in data) {
    return false;
  }

  return "value" in node;
}

function unknown(h, node) {
  if (text(node)) {
    return h.augment(node, u("text", node.value));
  }

  return h(node, "div", all(h, node));
}

function returnNode(h, node) {
  return node.children ? { ...node, children: all(h, node) } : node;
}

export function one(h, node, parent) {
  const type = node && node.type;
  let fn;

  if (!type) {
    throw new Error("Expected node, got `" + node + "`");
  }

  if (type in h.handlers) {
    fn = h.handlers[type];
  } else if (h.passThrough && h.passThrough.includes(type)) {
    fn = returnNode;
  } else {
    fn = h.unknownHandler;
  }

  return (typeof fn === "function" ? fn : unknown)(h, node, parent);
}

export function all(h, parent) {
  const nodes = parent.children || [];
  let values = [];
  let result;
  let head;

  for (const node of nodes) {
    result = one(h, node, parent);

    if (result) {
      if (node.type === "break") {
        if (result.type === "text") {
          result.value = result.value.replace(/^\s+/, "");
        }

        if (result.type === "element") {
          head = result.children[0];

          if (head && head.type === "text") {
            head.value = head.value.replace(/^\s+/, "");
          }
        }
      }

      values = values.concat(result);
    }
  }

  return values;
}

export function wrap(nodes, loose) {
  const result: any[] = [];
  let index = -1;

  if (loose) {
    result.push(u("text", "\n"));
  }

  while (++index < nodes.length) {
    if (index) result.push(u("text", "\n"));
    result.push(nodes[index]);
  }

  if (loose && nodes.length > 0) {
    result.push(u("text", "\n"));
  }

  return result;
}
