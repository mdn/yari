const unified = require("unified");
const parse = require("rehype-parse");
const rehype2remark = require("rehype-remark");
const stringify = require("remark-stringify");
const gfm = require("remark-gfm");

const handlers = require("./handlers");
const { decodeKS, encodeKS } = require("../utils");

function makeProcessor() {
  const processor = unified()
    .use(parse)
    .use(rehype2remark, { handlers })
    .use(gfm)
    .use(stringify, { fences: true, allowDangerousHtml: true });

  return processor;
}

async function h2m(html) {
  const ksEncoded = encodeKS(html);
  const processor = makeProcessor();

  const file = await processor.process(ksEncoded);
  return decodeKS(String(file));
}

function h2mSync(html) {
  const ksEncoded = encodeKS(html);
  const processor = makeProcessor();

  const file = processor.processSync(ksEncoded);
  return decodeKS(String(file));
}

module.exports = {
  h2m,
  h2mSync,
};
