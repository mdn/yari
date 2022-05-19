// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'unified'.
const unified = require("unified");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'parse'.
const parse = require("remark-parse");
const remark2rehype = require("remark-rehype");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'stringify'... Remove this comment to see the full error message
const stringify = require("rehype-stringify");
const gfm = require("remark-gfm");
const raw = require("rehype-raw");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'format'.
const format = require("rehype-format");

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'buildLocal... Remove this comment to see the full error message
const buildLocalizedHandlers = require("./handlers");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'decodeKS'.
const { decodeKS, encodeKS } = require("../utils");

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

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'm2h'.
async function m2h(md, options) {
  const ksEncoded = encodeKS(md);
  const processor = makeProcessor(options);

  const file = await processor.process(ksEncoded);
  return decodeKS(String(file));
}

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'm2hSync'.
function m2hSync(md, options) {
  const ksEncoded = encodeKS(md);
  const processor = makeProcessor(options);

  const file = processor.processSync(ksEncoded);
  return decodeKS(String(file));
}

module.exports = {
  m2h,
  m2hSync,
};
