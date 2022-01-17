const unified = require("unified");
const parse = require("rehype-parse");
const format = require("rehype-format");
const stringify = require("rehype-stringify");

const KS_RE = /{{([^}]*)}}/g;

function encodeKS(raw) {
  return raw.replace(
    KS_RE,
    (_, ks) => `{{${Buffer.from(ks).toString("base64")}}}`
  );
}

function decodeKS(raw) {
  return raw.replace(
    KS_RE,
    (_, ks) => `{{${Buffer.from(ks, "base64").toString()}}}`
  );
}

function formatH(html) {
  const ksEncoded = encodeKS(html);
  const processor = unified()
    .use(parse, { fragment: true })
    .use(stringify, { allowDangerousHtml: true })
    .use(format);

  const file = processor.processSync(ksEncoded);
  return decodeKS(String(file));
}

const prettyAST = (node, depth = 0) => {
  if (!node) {
    return "";
  }
  if (typeof node == "string") {
    return "  ".repeat(depth) + `${JSON.stringify(node)}`;
  }
  return Object.entries(node)
    .filter(([key]) => key != "position")
    .map(
      ([key, value]) =>
        "  ".repeat(depth) +
        key +
        ": " +
        (Array.isArray(value)
          ? "\n" + value.map((node) => prettyAST(node, depth + 1)).join("\n")
          : typeof value == "object"
          ? "\n" + prettyAST(value, depth + 1)
          : JSON.stringify(value))
    )
    .join("\n");
};

module.exports = {
  encodeKS,
  decodeKS,
  formatH,
  prettyAST,
};
