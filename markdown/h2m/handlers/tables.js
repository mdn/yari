const convert = require("hast-util-is-element/convert");
const visit = require("unist-util-visit");

const { h } = require("../utils");

const thead = convert("thead");
const tr = convert("tr");
const cell = convert(["th", "td"]);

// Infer whether the HTML table has a head and how it aligns.
function inspect(node) {
  let headless = true;
  const align = [null];
  let rowIndex = 0;
  let cellIndex = 0;

  visit(node, "element", visitor);

  return { align, headless };

  function visitor(child) {
    // If there is a `thead`, assume there is a header row.
    if (thead(child)) {
      headless = false;
    } else if (tr(child)) {
      rowIndex++;
      cellIndex = 0;
    } else if (cell(child)) {
      if (!align[cellIndex]) {
        align[cellIndex] = child.properties.align || null;
      }

      // If there is a th in the first row, assume there is a header row.
      if (headless && rowIndex < 2 && child.tagName === "th") {
        headless = false;
      }

      cellIndex++;
    }
  }
}

// Ensure the rows are properly structured.
function toRows(children, info) {
  const nodes = [];
  let index = -1;
  let node;
  let queue;

  // Add an empty header row.
  if (info.headless) {
    nodes.push({ type: "tableRow", children: [] });
  }

  while (++index < children.length) {
    node = children[index];

    if (node.type === "tableRow") {
      if (queue) {
        node.children = queue.concat(node.children);
        queue = undefined;
      }

      nodes.push(node);
    } else {
      if (!queue) queue = [];
      queue.push(node);
    }
  }

  if (queue) {
    node = nodes[nodes.length - 1];
    node.children = node.children.concat(queue);
  }

  index = -1;

  while (++index < nodes.length) {
    node = nodes[index];
    node.children = toCells(node.children, info);
  }

  return nodes;
}

// Ensure the cells in a row are properly structured.
function toCells(children, info) {
  const nodes = [];
  let index = -1;
  let node;
  let queue;

  while (++index < children.length) {
    node = children[index];

    if (node.type === "tableCell") {
      if (queue) {
        node.children = queue.concat(node.children);
        queue = undefined;
      }

      nodes.push(node);
    } else {
      if (!queue) queue = [];
      queue.push(node);
    }
  }

  if (queue) {
    node = nodes[nodes.length - 1];

    if (!node) {
      node = { type: "tableCell", children: [] };
      nodes.push(node);
    }

    node.children = node.children.concat(queue);
  }

  index = nodes.length - 1;

  while (++index < info.align.length) {
    nodes.push({ type: "tableCell", children: [] });
  }

  return nodes;
}

module.exports = [
  [
    { is: "table", canHaveClass: "standard-table" },
    (node, t) => {
      const info = inspect(node);
      return h(node, "table", { align: info.align }, toRows(t(node), info));
    },
  ],

  [["thead", "tbody"], (node, t) => t(node)],

  ["tr", (node, t) => h(node, "tableRow", {}, t(h, node))],

  [
    ["th", "td"],
    (node, t) => h(node, "tableCell", {}, t(node, { shouldWrap: true })),
  ],
];
