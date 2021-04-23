const h = (node, type, props, children) => ({
  type,
  ...props,
  ...(typeof children === "string"
    ? { value: children }
    : children && { children }),
  ...(node.position && { position: node.position }),
});

const trimTrailingNewLines = (value) => String(value).replace(/\n+$/, "");

const wrapText = (value, { shouldWrap }) =>
  shouldWrap ? value.replace(/\r?\n|\r/g, " ") : value;

module.exports = { h, trimTrailingNewLines, wrapText };
