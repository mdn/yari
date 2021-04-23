const unified = require("unified");
const parse = require("rehype-parse");
const remarkPrettier = require("remark-prettier");
const gfm = require("remark-gfm");

const { decodeKS, encodeKS } = require("../utils");
const handlers = require("./handlers");
const { transform } = require("./transform");

const getTransformProcessor = () =>
  unified()
    .use(parse)
    .use(transform, handlers)
    .use(gfm)
    .use(remarkPrettier, { report: false, options: { proseWrap: "always" } });

async function run(html) {
  const file = await getTransformProcessor()
    .use(() => ([node, unhandled]) => {
      console.warn(unhandled);
      const ff = ({ position, children, ...node }) => ({
        ...node,
        children: children && children.map(ff),
      });
      console.log(JSON.stringify(ff(node), null, 2));
      return node;
    })
    .process(encodeKS(html));
  return decodeKS(String(file));
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
