const phrasing = require("mdast-util-phrasing");

const spread = (children) =>
  children.length > 1 && children.some((child) => child.spread);

// Wrap all runs of mdast phrasing content in `paragraph` nodes.
function runs(nodes, onphrasing, onnonphrasing) {
  const nonphrasing = onnonphrasing || ((n) => n);
  const flattened = flatten(nodes);
  let result = [];
  let index = -1;
  let node;
  let queue;

  while (++index < flattened.length) {
    node = flattened[index];

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
function needed(nodes) {
  let index = -1;
  let node;

  while (++index < nodes.length) {
    node = nodes[index];

    if (!phrasing(node) || (node.children && needed(node.children))) {
      return true;
    }
  }
}

function flatten(nodes) {
  let flattened = [];
  let index = -1;
  let node;

  while (++index < nodes.length) {
    node = nodes[index];

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

function wrap(nodes) {
  return runs(nodes, onphrasing);

  function onphrasing(nodes) {
    const head = nodes[0];

    if (
      nodes.length === 1 &&
      head.type === "text" &&
      (head.value === " " || head.value === "\n")
    ) {
      return [];
    }

    return { type: "paragraph", children: nodes };
  }
}

module.exports = { spread, wrap };
