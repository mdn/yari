const toHtml = require("hast-util-to-html");
const toText = require("hast-util-to-text");
const trim = require("trim-trailing-lines");

const { h, trimTrailingNewLines, wrapText } = require("../utils");
const { spread, wrap } = require("./rehype-remark-util");
const tables = require("./tables");

const isBare = (node, { ignore } = {}) =>
  Object.keys(node.properties).filter((key) => !ignore || !ignore.includes(key))
    .length === 0;

const toCode = (lang) => (node, t, opts) =>
  h(node, "code", { lang }, trimTrailingNewLines(wrapText(toText(node), opts)));

module.exports = [
  [
    (node) => ["html", "head", "body"].includes(node.tagName) && isBare(node),
    (node, t) => wrap(t(node)),
  ],

  [
    (node) =>
      ["h1", "h2", "h3", "h4"].includes(node.tagName) &&
      isBare(node, { ignore: ["id"] }),
    (node, t) =>
      h(
        node,
        "heading",
        { depth: Number(node.tagName.charAt(1)) || 1 },
        t(node, { shouldWrap: true })
      ),
  ],

  [["div", "p"], (node, t) => h(node, "paragraph", {}, t(node))],
  ["em", (node, t) => h(node, "emphasis", t(h, node))],
  ["strong", (node, t) => h(node, "strong", t(node))],
  ["br", (node) => (h.wrapText ? h(node, "break") : h(node, "text", {}, " "))],

  [
    (node) =>
      node.tagName == "a" && isBare(node, { ignore: ["href", "title", "rel"] }),
    (node, t) =>
      h(
        node,
        "link",
        {
          title: node.properties.title || null,
          url: node.properties.href,
        },
        t(node)
      ),
  ],

  [
    ["ul", "ol"],
    function list(node, t) {
      const ordered = node.tagName == "ol";
      const children = t(node).map((child) =>
        child.type === "listItem"
          ? child
          : {
              type: "listItem",
              spread: false,
              checked: null,
              children: [child],
            }
      );
      return h(
        node,
        "list",
        {
          ordered,
          start: ordered ? node.properties.start || 1 : null,
          spread: spread(children),
        },
        children
      );
    },
  ],

  [
    (node) => node.tagName == "li" && isBare(node, { ignore: ["id"] }),
    (node, t) => {
      const content = wrap(t(node));
      return h(node, "listItem", { spread: content.length > 1 }, content);
    },
  ],

  ...tables,

  [
    "code",
    (node, t, opts) => h(node, "code", {}, trim(wrapText(toText(node), opts))),
  ],

  ["pre.brush:.js", toCode("javascript")],
  ["pre.brush:.html", toCode("html")],
  ["pre.brush:.css", toCode("css")],

  ["math", (node) => h(node, "html", {}, toHtml(node))],
];
