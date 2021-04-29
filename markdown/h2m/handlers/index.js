const toHtml = require("hast-util-to-html");
const toText = require("hast-util-to-text");
const trim = require("trim-trailing-lines");

const { h, trimTrailingNewLines, wrapText } = require("../utils");
const { code, spread, wrap } = require("./rehype-remark-util");
const tables = require("./tables");

module.exports = [
  [(node) => node.type == "root", (node, t) => h(node, "root", {}, t(node))],

  [
    (node) => node.type == "text",
    (node, t, opts) => h(node, "text", {}, wrapText(node.value, opts)),
  ],

  [
    (node) => node.type == "comment",
    (node, t, opts) =>
      h(node, "html", {}, "<!--" + wrapText(node.value, opts) + "-->"),
  ],

  [["html", "head", "body"], (node, t) => wrap(t(node))],

  [
    {
      is: ["h1", "h2", "h3", "h4", "h5"],
      canHave: "id",
      canHaveClass: ["example", "name", "highlight-spanned"],
    },
    (node, t) =>
      h(
        node,
        "heading",
        { depth: Number(node.tagName.charAt(1)) || 1 },
        t(node, { shouldWrap: true })
      ),
  ],

  [
    { is: "div", canHaveClass: ["twocolumns", "threecolumns", "noinclude"] },
    // TODO: attach noinclude
    (node, t) =>
      !node.children
        ? h(node, "html", {}, toHtml(node))
        : [
            h(
              node,
              "html",
              {},
              toHtml({ ...node, children: null }, { voids: ["div"] })
            ),
            ...t(node),
            h(node, "html", {}, "</div>"),
          ],
  ],

  [
    {
      is: ["span", "small", "dfn"],
      canHave: ["id"],
      canHaveClass: [
        "pl-s",
        "highlight-span",
        "objectBox",
        "objectBox-string",
        "devtools-monospace",
        "message-body",
        "message-flex-body",
        "message-body-wrapper",
      ],
    },
    (node, t) => t(node),
  ],

  [
    { is: "p", canHaveClass: ["brush:", "js"] },
    (node, t) => h(node, "paragraph", {}, t(node)),
  ],
  ["em", (node, t) => h(node, "emphasis", {}, t(node))],
  ["strong", (node, t) => h(node, "strong", {}, t(node))],
  [
    "br",
    (node, t, { shouldWrap }) =>
      shouldWrap ? h(node, "break") : h(node, "text", {}, " "),
  ],

  [
    {
      is: "a",
      has: "href",
      // TODO: should swallow target=_blank? Should all our external links have new tab behavior?
      canHave: ["title", "rel", "target"],
      canHaveClass: ["link-https", "mw-redirect", "external", "external-icon"],
    },
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
    { is: ["ul", "ol"], canHaveClass: ["threecolumns"] },
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
    { is: "li", canHave: "id" },
    (node, t) => {
      const content = wrap(t(node, { shouldWrap: true }));
      return h(node, "listItem", { spread: content.length > 1 }, content);
    },
  ],

  ...tables,

  // TODO: currently drops links (and other markup) inside of code
  [
    ["code", "kbd"],
    (node, t, opts) =>
      h(node, "inlineCode", {}, trim(wrapText(toText(node), opts))),
  ],

  [
    { is: "pre", canHaveClass: ["eval", "notranslate", "syntaxbox"] },
    (node, t, opts) => code(node, opts),
  ],

  ...["js", "html", "css", "json", "plain", "cpp", "java", "bash"].flatMap(
    (lang) =>
      // shows up with/without semicolon
      ["brush:" + lang, `brush:${lang};`, lang, lang + ";"].map((hasClass) => [
        {
          is: "pre",
          hasClass,
          canHaveClass: [
            "brush:",
            "brush",
            "example-good",
            "example-bad",
            "no-line-numbers",
            "line-numbers",
            "notranslate",
            (className) => className.startsWith("highlight"),
          ],
        },
        (node, t, opts) =>
          h(
            node,
            "code",
            {
              lang,
              meta: node.properties.className.filter((c) => c == lang),
            },
            trimTrailingNewLines(wrapText(toText(node), opts))
          ),
      ])
  ),

  [
    {
      is: "img",
      has: "src",
      canHave: ["title", "alt"],
      canHaveClass: "internal",
    },
    (node) => {
      const { src, title, alt } = node.properties;
      return h(node, "image", {
        url: src,
        title: title || null,
        alt: alt || "",
      });
    },
  ],

  [
    { is: "math", canHave: "display" },
    (node) => h(node, "html", {}, toHtml(node)),
  ],

  ["blockquote", (node, t) => h(node, "blockquote", {}, wrap(t(node)))],

  [{ is: ["i", "u"] }, (node, t) => h(node, "emphasis", {}, t(node))],
  ["b", (node, t) => h(node, "strong", {}, t(node))],

  [
    "q",
    (node, t) => [
      { type: "text", value: '"' },
      ...t(node),
      { type: "text", value: '"' },
    ],
  ],

  // TODO TBD
  ["caption", (node, t) => h(node, "paragraph", {}, t(node))],

  // <TODO> TBD
  ["sub", (node) => h(node, "html", {}, toHtml(node))],
  ["var", (node) => h(node, "html", {}, toHtml(node))],
  ["sup", (node) => h(node, "html", {}, toHtml(node))],
  ["dl", (node) => h(node, "html", {}, toHtml(node))],
  [
    { hasClass: "note", canHaveClass: "notecard" },
    (node) => h(node, "html", {}, toHtml(node)),
  ],
  [
    { hasClass: "notecard", canHaveClass: "warning" },
    (node) => h(node, "html", {}, toHtml(node)),
  ],
  [{ hasClass: "warning" }, (node) => h(node, "html", {}, toHtml(node))],

  [{ hasClass: "seoSummary" }, (node) => h(node, "html", {}, toHtml(node))],
  [{ hasClass: "summary" }, (node) => h(node, "html", {}, toHtml(node))],
  // </TODO>
];
