const minify = require("rehype-minify-whitespace");

const handlers = require("./handlers");
const { UnexpectedElementError } = require("./handlers/to-text");
const { h, toPrettyHTML, wrapText } = require("./utils");

// These tags will bubble errors up when they occur, so that not only them,
// but also their parents, get turned into HTML
const CHILD_TAGS = ["li", "thead", "tbody", "th", "tr", "td"];

const toSelector = ({ tagName, properties: { id, className, ...rest } }) =>
  [
    tagName,
    id ? "#" + id : "",
    className && className.length > 0 ? "." + className.join(".") : "",
    Object.entries(rest)
      .map(([key, value]) => `[${key}${value === "" ? "" : `="${value}"`}]`)
      .join(""),
  ].join("");

const asArray = (v) => (v ? (Array.isArray(v) ? v : [v]) : []);

const isExhaustive = (source, required, optional) => {
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

const isHandled = (node, check) => {
  if (typeof check == "function") {
    return check(node);
  }

  if (node.type !== "element") {
    return false;
  }

  const isArray = Array.isArray(check);
  if (isArray || typeof check == "string") {
    return (isArray ? check : [check]).includes(toSelector(node));
  }

  if (
    check.is &&
    !asArray(check.is).some((tagName) => node.tagName == tagName)
  ) {
    return false;
  }

  const { className, ...props } = node.properties;
  return (
    isExhaustive(Object.keys(props), check.has, check.canHave) &&
    isExhaustive(className, check.hasClass, check.canHaveClass)
  );
};

function transformNode(node, opts = {}) {
  const selector = node.type === "element" && toSelector(node);
  const unhandled = [];

  function transformChildren(node, subOpts = {}) {
    const newOpts = { ...opts, ...subOpts };
    if (node.value) {
      return h(node, "text", wrapText(node.value, newOpts));
    } else {
      const transformed = (Array.isArray(node) ? node : node.children || [])
        .map((child) => {
          const [transformed, childUnhandled] = transformNode(child, newOpts);
          unhandled.push(...childUnhandled);
          return transformed;
        })
        .flat();

      return transformed;
    }
  }

  let transformed = null;
  const handler = handlers.find(([check]) => isHandled(node, check));
  if (handler) {
    const handle = handler[1];
    try {
      transformed = handle(node, transformChildren, opts);
    } catch (error) {
      if (CHILD_TAGS.includes(node.tagName)) {
        throw error;
      }
      if (error instanceof UnexpectedElementError) {
        unhandled.push(toSelector(error.element));
      } else {
        console.error("error while handling", node, ":", error);
      }
    }
  } else if (selector) {
    unhandled.push(selector);
  }

  if (
    opts.noBlocks &&
    !(Array.isArray(transformed) ? transformed : [transformed]).every((node) =>
      [
        "tableRow",
        "tableCell",
        "text",
        "emphasis",
        "strong",
        "inlineCode",
        "link",
      ].includes(node.type)
    )
  ) {
    throw new UnexpectedElementError(node);
  }

  // if child tags need to be turned into HTML, so do their parents
  if (!transformed && CHILD_TAGS.includes(node.tagName)) {
    throw new UnexpectedElementError(node);
  }

  return [transformed || h(node, "html", toPrettyHTML(node)), unhandled];
}

function toMdast(tree, options) {
  minify({ newlines: true })(tree);
  return transformNode(tree, options);
}

// If a destination is given, runs the destination with the new mdast tree
// (bridge-mode).
// Without destination, returns the mdast tree: further plugins run on that tree
// (mutate-mode).
function transform(destination, options) {
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

module.exports = { transform };
