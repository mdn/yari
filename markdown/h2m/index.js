const cheerio = require("cheerio");
const unified = require("unified");
const parse = require("rehype-parse");
const remarkPrettier = require("remark-prettier");
const gfm = require("remark-gfm");

const {
  extractSections,
  extractSummary,
} = require("../../build/document-extractor");
const { decodeKS, encodeKS, prettyPrintAST } = require("../utils");
const { transform } = require("./transform");

const getTransformProcessor = (options) =>
  unified()
    .use(parse)
    .use(transform, options)
    .use(gfm)
    .use(remarkPrettier, { report: false, options: { proseWrap: "always" } });

async function run(html) {
  const encodedHTML = encodeKS(html);
  const summary = extractSummary(
    extractSections(cheerio.load(`<div id="_body">${encodedHTML}</div>`))[0]
  );
  const file = await getTransformProcessor({ summary })
    .use(() => ([node, unhandled]) => {
      console.warn(unhandled);
      // prettyPrintAST(node);
      return node;
    })
    .process(encodedHTML);
  return decodeKS(String(file))
    .split("\n")
    .filter((line) => !line.includes("<!-- prettier-ignore -->"))
    .join("\n");
}

async function dryRun(html) {
  let unhandled;
  await getTransformProcessor()
    .use(() => ([node, u]) => {
      unhandled = u;
      return node;
    })
    .process(encodeKS(html));
  return unhandled;
}

module.exports = {
  run,
  dryRun,
};
