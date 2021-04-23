const { h, wrapText } = require("./utils");

const toSelector = ({ tagName, properties: { id, className, ...rest } }) =>
  [
    tagName,
    id ? "#" + id : "",
    className && className.length > 0 ? "." + className.join(".") : "",
    Object.entries(rest)
      .map(([key, value]) => `[${key}${value === "" ? "" : `="${value}"`}]`)
      .join(""),
  ].join("");

function transformNode(node, handlers, opts = {}) {
  const selector = node.type === "element" && toSelector(node);
  const unhandled = [];

  const handler = handlers.find(([check]) =>
    typeof check == "function"
      ? check(node)
      : (Array.isArray(check) ? check : [check]).includes(selector)
  );

  function transformChildren(node, subOpts = {}) {
    const newOpts = { ...opts, ...subOpts };
    if (node.value) {
      return h(node, "text", {}, wrapText(node.value, newOpts));
    } else {
      return (node.children || [])
        .map((child) => {
          const [transformed, childUnhandled] = transformNode(
            child,
            handlers,
            newOpts
          );
          unhandled.push(...childUnhandled);
          return transformed;
        })
        .flat();
    }
  }

  let transformed = null;
  if (handler) {
    const handle = handler[1];
    transformed = handle(node, transformChildren, opts);
  } else if (selector) {
    unhandled.push(selector);
  }

  return [transformed || transformChildren(node), unhandled];
}

function toMdast(tree, handlers) {
  // minify({ newlines: true })(tree);
  return transformNode(tree, [
    [(node) => node.type == "root", (node, t) => h(node, "root", {}, t(node))],
    ...handlers,
  ]);
}

// If a destination is given, runs the destination with the new mdast tree
// (bridge-mode).
// Without destination, returns the mdast tree: further plugins run on that tree
// (mutate-mode).
function transform(destination, options) {
  let settings;

  if (destination && !destination.process) {
    settings = destination;
    destination = null;
  }

  settings = settings || options || {};

  return destination
    ? function transformer(node, file, next) {
        destination.run(toMdast(node, settings), file, (err) => next(err));
      }
    : (node) => toMdast(node, settings);
}

module.exports = { transform };
