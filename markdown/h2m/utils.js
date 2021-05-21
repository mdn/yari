const toHTML = require("hast-util-to-html");
const prettier = require("prettier");

const h = (node, type, children, props = {}) => ({
  type,
  ...props,
  ...(typeof children === "string"
    ? { value: children }
    : children && {
        children: Array.isArray(children) ? children : [children],
      }),
  ...(node.position && { position: node.position }),
});

const toPrettyHTML = (...args) =>
  prettier.format(toHTML(...args), { semi: false, parser: "html" });

const wrapText = (value, { shouldWrap }) =>
  shouldWrap ? value.replace(/\r?\n|\r/g, " ") : value;

module.exports = { h, toPrettyHTML, wrapText };
