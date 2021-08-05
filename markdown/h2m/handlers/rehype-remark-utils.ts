/*
These functions are taken from https://github.com/syntax-tree/hast-util-to-mdast
Unfortunately the library does not export those functions, so I needed to copy them.
Some have been slightly refactored for our usage and readability
 */

const has = require("hast-util-has-property");
const toText = require("hast-util-to-text");
const phrasing = require("mdast-util-phrasing");
const trim = require("trim-trailing-lines");

import { h } from "../h";
import { wrapText } from "../utils";

// Wrap all runs of mdast phrasing content in `paragraph` nodes.
function runs(nodes, onphrasing = null, onnonphrasing = null) {
  const nonphrasing = onnonphrasing || ((n) => n);
  const flattened = flatten(nodes);
  let result = [];
  let queue;

  for (const node of flattened) {
    if (phrasing(node)) {
      if (!queue) queue = [];
      queue.push(node);
    } else {
      if (queue) {
        result = result.concat(onphrasing(queue));
        queue = undefined;
      }

      result = result.concat(nonphrasing(node));
    }
  }

  if (queue) {
    result = result.concat(onphrasing(queue));
  }

  return result;
}

const split = (node) =>
  runs(
    node.children,
    // Use `parent`, put the phrasing run inside it.
    (nodes) => Object.assign({ children: nodes }, node),
    // Use `child`, add `parent` as its first child, put the original children
    // into `parent`.
    function onnonphrasing(child) {
      const parent = Object.assign({}, node);
      const copy = Object.assign({}, child);

      copy.children = [parent];
      parent.children = child.children;

      return copy;
    }
  );

// Check if there are non-phrasing mdast nodes returned.
// This is needed if a fragment is given, which could just be a sentence, and
// doesn’t need a wrapper paragraph.
const needed = (nodes) =>
  (nodes || []).some(
    (node) => !phrasing(node) || (node.children && needed(node.children))
  );

function flatten(nodes) {
  let flattened = [];
  for (const node of nodes) {
    // Straddling: some elements are *weird*.
    // Namely: `map`, `ins`, `del`, and `a`, as they are hybrid elements.
    // See: <https://html.spec.whatwg.org/#paragraphs>.
    // Paragraphs are the weirdest of them all.
    // See the straddling fixture for more info!
    // `ins` is ignored in mdast, so we don’t need to worry about that.
    // `map` maps to its content, so we don’t need to worry about that either.
    // `del` maps to `delete` and `a` to `link`, so we do handle those.
    // What we’ll do is split `node` over each of its children.
    if (
      (node.type === "delete" || node.type === "link") &&
      needed(node.children)
    ) {
      flattened = flattened.concat(split(node));
    } else {
      flattened.push(node);
    }
  }
  return flattened;
}

export const wrap = (nodes) =>
  runs(nodes, (nodes) => {
    const head = nodes[0];
    if (
      nodes.length === 1 &&
      head.type === "text" &&
      (head.value === " " || head.value === "\n")
    ) {
      return [];
    }

    return { type: "paragraph", children: nodes };
  });

const prefix = "language-";

export function code(node, opts) {
  var children = node.children;
  var index = -1;
  var classList;
  var lang;

  if (node.tagName == "pre") {
    while (++index < children.length) {
      if (
        children[index].tagName == "code" &&
        has(children[index], "className")
      ) {
        classList = children[index].properties.className;
        break;
      }
    }
  }

  if (classList) {
    index = -1;

    while (++index < classList.length) {
      if (classList[index].slice(0, prefix.length) === prefix) {
        lang = classList[index].slice(prefix.length);
        break;
      }
    }
  }

  return h("code", trim(wrapText(toText(node, opts), opts)), {
    lang: lang || null,
    meta: null,
  });
}
