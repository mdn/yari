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

const wrapText = (value, { shouldWrap }) =>
  shouldWrap ? value.replace(/\r?\n|\r/g, " ") : value;

module.exports = { h, wrapText };
