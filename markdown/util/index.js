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

function withFm(frontmatter, content) {
  if (frontmatter) {
    return `---\n${frontmatter}\n---\n${content}`;
  }
  return content;
}

function trimTrailingNewLines(value) {
  return String(value).replace(/\n+$/, "");
}

function wrapText(h, value) {
  return h.wrapText ? value : value.replace(/\r?\n|\r/g, " ");
}

module.exports = {
  encodeKS,
  decodeKS,
  formatH,
  withFm,
  trimTrailingNewLines,
  wrapText,
};
