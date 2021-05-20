const cheerio = require("cheerio");
const unified = require("unified");
const parse = require("rehype-parse");
const remarkPrettier = require("remark-prettier");
const gfm = require("remark-gfm");

const {
  extractSections,
  extractSummary,
} = require("../../build/document-extractor");
const { decodeKS, encodeKS } = require("../utils");
const { transform } = require("./transform");

const getTransformProcessor = (options) =>
  unified()
    .use(parse)
    .use(transform, options)
    .use(gfm)
    .use(remarkPrettier, { report: false, options: { proseWrap: "always" } });

module.exports = async function h2m(html) {
  const encodedHTML = encodeKS(html);
  const summary = extractSummary(
    extractSections(cheerio.load(`<div id="_body">${encodedHTML}</div>`))[0]
  );

  let unhandled;
  const file = await getTransformProcessor({ summary })
    .use(() => ([node, u]) => {
      unhandled = u;
      return node;
    })
    .process(encodedHTML);

  return [
    decodeKS(String(file))
      .split("\n")
      .filter((line) => !line.includes("<!-- prettier-ignore -->"))
      .join("\n"),
    unhandled,
  ];
};
