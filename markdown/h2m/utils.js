import toHTML from "hast-util-to-html";
import prettier from "prettier";

export const asArray = (v) => (v ? (Array.isArray(v) ? v : [v]) : []);

export const wrapText = (value, { shouldWrap }) =>
  shouldWrap ? value.replace(/\r?\n|\r/g, " ") : value;

export class InvalidASTError extends Error {
  constructor(targetType, nodes) {
    super("invalid AST due to unexpected children");
    this.targetType = targetType;
    this.nodes = nodes;
  }
}

export const toPrettyHTML = (...args) => {
  const source = toHTML(...args);

  // Prettier often breaks starting tags but that does not seem to be an issue for
  // our <table> tags for which we are mainly interested in prettier HTML, hence
  // we only prettify those.
  if (!source.startsWith("<table")) {
    return source;
  }

  return prettier
    .format(source, {
      semi: false,
      parser: "html",
    })
    .trim();
};

export const toSelector = ({
  tagName,
  properties: { id, className, ...rest },
}) => {
  const classList = asArray(className);
  return [
    tagName,
    id ? "#" + id : "",
    classList.length > 0 ? "." + classList.join(".") : "",
    Object.entries(rest)
      .map(([key, value]) => `[${key}${value === "" ? "" : `="${value}"`}]`)
      .join(""),
  ].join("");
};
