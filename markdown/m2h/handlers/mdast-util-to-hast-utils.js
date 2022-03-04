/*
These functions are more-or-less verbatim from https://github.com/syntax-tree/mdast-util-to-hast
Unfortunately the module was not exporting them, so they needed to be copied.
 */

const u = require("unist-builder");
const { pointStart, pointEnd } = require("./unist-util-position");

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

function one(h, node, parent) {
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

function all(h, parent) {
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

function wrap(nodes, loose) {
  const result = [];
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

/**
 * @type {Handler}
 * @param {Table} node
 */
function table(h, node) {
  const rows = node.children;
  let index = -1;
  const align = node.align || [];
  /** @type {Array<Element>} */
  const result = [];

  while (++index < rows.length) {
    const row = rows[index].children;
    const name = index === 0 ? "th" : "td";
    /** @type {Array<Content>} */
    const out = [];
    let cellIndex = -1;
    const length = node.align ? align.length : row.length;

    while (++cellIndex < length) {
      const cell = row[cellIndex];
      out.push(
        h(cell, name, { align: align[cellIndex] }, cell ? all(h, cell) : [])
      );
    }

    result[index] = h(rows[index], "tr", wrap(out, true));
  }

  return h(
    node,
    "table",
    wrap(
      [h(result[0].position, "thead", wrap([result[0]], true))].concat(
        result[1]
          ? h(
              {
                start: pointStart(result[1]),
                end: pointEnd(result[result.length - 1]),
              },
              "tbody",
              wrap(result.slice(1), true)
            )
          : []
      ),
      true
    )
  );
}

module.exports = { one, all, wrap, table };
