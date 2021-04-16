const unified = require("unified");
const parse = require("remark-parse");
const remark2rehype = require("remark-rehype");
const stringify = require("rehype-stringify");
const gfm = require("remark-gfm");
const raw = require("rehype-raw");
const format = require("rehype-format");

const handlers = require("./handlers");
const { decodeKS, encodeKS } = require("../utils");

function makeProcessor() {
  const processor = unified()
    .use(parse)
    .use(gfm)
    .use(remark2rehype, { handlers, allowDangerousHtml: true })
    .use(raw, { allowDangerousHtml: true })
    .use(stringify, { allowDangerousHtml: true })
    .use(format);

  return processor;
}

async function m2h(md) {
  const ksEncoded = encodeKS(md);
  const processor = makeProcessor();

  const file = await processor.process(ksEncoded);
  return decodeKS(String(file));
}

function m2hSync(md) {
  const ksEncoded = encodeKS(md);
  const processor = makeProcessor();

  const file = processor.processSync(ksEncoded);
  return decodeKS(String(file));
}

module.exports = {
  m2h,
  m2hSync,
};
