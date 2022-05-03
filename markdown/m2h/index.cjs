const unified = require("unified");
const parse = require("remark-parse");
const remark2rehype = require("remark-rehype");
const stringify = require("rehype-stringify");
const gfm = require("remark-gfm");
const raw = require("rehype-raw");
const format = require("rehype-format");

const buildLocalizedHandlers = require("./handlers/index.cjs");
const { decodeKS, encodeKS } = require("../utils/index.cjs");

function makeProcessor(options) {
  const localizedHandlers = buildLocalizedHandlers(options.locale);
  const processor = unified()
    .use(parse)
    .use(gfm)
    .use(remark2rehype, {
      handlers: localizedHandlers,
      allowDangerousHtml: true,
    })
    .use(raw, { allowDangerousHtml: true })
    .use(stringify, { allowDangerousHtml: true })
    .use(format);

  return processor;
}

async function m2h(md, options) {
  const ksEncoded = encodeKS(md);
  const processor = makeProcessor(options);

  const file = await processor.process(ksEncoded);
  return decodeKS(String(file));
}

function m2hSync(md, options) {
  const ksEncoded = encodeKS(md);
  const processor = makeProcessor(options);

  const file = processor.processSync(ksEncoded);
  return decodeKS(String(file));
}

module.exports = { m2h, m2hSync };
