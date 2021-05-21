const trimTrailingLines = require("trim-trailing-lines");

const { h, toPrettyHTML, wrapText } = require("../utils");
const { code, wrap } = require("./rehype-remark-utils");
const cards = require("./cards");
const tables = require("./tables");
const { prettyPrintAST } = require("../../utils");
const { toText, UnexpectedElementError } = require("./to-text");

/**
 * Some nodes like **strong** or __emphasis__ can't have leading/trailing spaces
 * This function extracts those and returns them as text nodes instead.
 */
const extractSpacing = (node) => {
  let pre = "";
  let post = "";

  node = {
    ...node,
    children: node.children.map((child, i) => {
      const isFirst = i == 0;
      const isLast = i + 1 == node.children.length;

      const { type, value } = child;

      if (type != "text" || !(isFirst || isLast)) {
        return child;
      }

      const isNotSpace = (s) => !!s.trim();

      if (isFirst) {
        pre = value.slice(0, value.split("").findIndex(isNotSpace));
      }
      if (isLast) {
        post = value.slice(
          value.length - value.split("").reverse().findIndex(isNotSpace)
        );
      }

      return {
        ...child,
        value: value.slice(pre.length, value.length - post.length),
      };
    }),
  };

  return [
    ...(pre ? [{ type: "text", value: pre }] : []),
    node,
    ...(post ? [{ type: "text", value: post }] : []),
  ];
};
const toDefinitionItem = (node, terms, definitions) => {
  const definitionStart = h(node, "text", ": ");
  if (definitions[0].type == "paragraph") {
    definitions[0].children.unshift(definitionStart);
  } else {
    definitions.unshift(h(node, "paragraph", definitionStart));
  }
  return h(
    node,
    "listItem",
    [
      ...terms,
      h(node, "list", h(node, "listItem", definitions, { spread: false }), {
        spread: false,
      }),
    ],
    { spread: false }
  );
};

module.exports = [
  [(node) => node.type == "root", (node, t) => h(node, "root", t(node))],

  [
    (node) => node.type == "text",
    (node, t, opts) => h(node, "text", wrapText(node.value, opts)),
  ],

  [
    (node) => node.type == "comment",
    (node, t, opts) =>
      h(node, "html", "<!--" + wrapText(node.value, opts) + "-->"),
  ],

  [["html", "head", "body"], (node, t) => wrap(t(node))],

  [
    {
      is: ["h1", "h2", "h3", "h4", "h5"],
      canHave: "id",
      canHaveClass: ["example", "name", "highlight-spanned"],
    },
    (node, t) =>
      h(node, "heading", t(node, { shouldWrap: true, singleLine: true }), {
        depth: Number(node.tagName.charAt(1)) || 1,
      }),
  ],

  [
    { is: "div", canHaveClass: ["twocolumns", "threecolumns", "noinclude"] },
    // TODO: attach noinclude to MD node
    (node) =>
      h(
        node,
        "html",
        toPrettyHTML(
          (node.children || []).length == 1 && node.children[0].type == "text"
            ? node.children[0]
            : node
        )
      ),
  ],

  [
    {
      is: ["span", "small"],
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
    (node, t) => h(node, "paragraph", t(node)),
  ],
  [
    "br",
    (node, t, { shouldWrap, singleLine }) =>
      shouldWrap
        ? singleLine
          ? h(node, "html", toPrettyHTML(node))
          : h(node, "break")
        : h(node, "text", " "),
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
      h(node, "link", t(node), {
        title: node.properties.title || null,
        url: node.properties.href,
      }),
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
      return h(node, "list", children, {
        ordered,
        start: ordered ? node.properties.start || 1 : null,
        spread: false,
      });
    },
  ],

  [
    { is: "li", canHave: "id" },
    (node, t) => {
      const content = wrap(t(node));
      return h(node, "listItem", content, { spread: content.length > 1 });
    },
  ],

  ...tables,
  ...cards,

  // Turn <code><a href="/some-link">someCode</a></code> into [`someCode`](/someLink) (other way around)
  [
    (node) =>
      node.tagName == "code" &&
      // inline code currently has padding on MDN, thus multiple adjacent tags
      // would appear to have a space in between, hence we don't convert to it.
      node.children.length == 1 &&
      node.children.some((child) => ["a", "strong"].includes(child.tagName)),
    (node) =>
      node.children.map((child) => {
        switch (child.tagName) {
          case "a":
            return h(child, "link", h(node, "inlineCode", toText(child)), {
              title: child.properties.title || null,
              url: child.properties.href,
            });

          case "strong":
            return h(child, "strong", h(node, "inlineCode", toText(child)));

          default:
            return h(node, "inlineCode", toText(child));
        }
      }),
  ],

  [
    "code",
    (node, t, opts) => {
      const targetNode =
        node.children.length == 1 && node.children[0].tagName == "var"
          ? node.children[0]
          : node;
      return h(
        node,
        "inlineCode",
        trimTrailingLines(wrapText(toText(targetNode), opts))
      );
    },
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
        (node, t, opts) => [
          h(node, "html", "<!-- prettier-ignore -->\n"),
          h(node, "code", trimTrailingLines(wrapText(toText(node), opts)), {
            lang,
            meta: node.properties.className
              .filter((c) => c.startsWith("example-"))
              .join(" "),
          }),
        ],
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
      return h(node, "image", null, {
        url: src,
        title: title || null,
        alt: alt || "",
      });
    },
  ],

  [
    { is: "math", canHave: "display" },
    (node) => h(node, "html", toPrettyHTML(node)),
  ],

  ["blockquote", (node, t) => h(node, "blockquote", wrap(t(node)))],

  [
    { is: ["i", "em"] },
    (node, t) => extractSpacing(h(node, "emphasis", t(node))),
  ],
  [
    { is: ["b", "strong"] },
    (node, t) => extractSpacing(h(node, "strong", t(node))),
  ],

  [
    "q",
    (node, t) => [
      { type: "text", value: '"' },
      ...t(node),
      { type: "text", value: '"' },
    ],
  ],

  [
    "dl",
    (node, t) => {
      const children = [];
      let terms = [];
      for (const child of node.children) {
        if (child.tagName == "dt") {
          terms.push(h(node, "paragraph", t(child)));
        } else if (child.tagName == "dd" && terms.length > 0) {
          children.push(toDefinitionItem(node, terms, t(child)));
          terms = [];
        } else {
          throw new UnexpectedElementError(child);
        }
      }
      return h(node, "list", children, { spread: false });
    },
  ],

  ...["summary", "seoSummary"].map((className) => [
    { hasClass: className },
    (node, t, { summary }) => {
      const trimIntoSingleLine = (text) => text.replace(/\s\s+/g, " ").trim();
      if (
        !summary ||
        trimIntoSingleLine(toText(node)) != trimIntoSingleLine(summary)
      ) {
        throw new UnexpectedElementError(node);
      }
      return h(node, "paragraph", t(node));
    },
  ]),
];
