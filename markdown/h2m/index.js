const unified = require("unified");
const parse = require("rehype-parse");
const remarkPrettier = require("remark-prettier");
const gfm = require("remark-gfm");

const { decodeKS, encodeKS } = require("../utils");
const { transform } = require("./transform");

const prettyPrintAST = (node, depth = 0) => {
  if (typeof node == "string") {
    console.log("  ".repeat(depth) + node);
    return;
  }
  for (const [key, value] of Object.entries(node)) {
    if (key == "position") {
      continue;
    }

    console.log(
      "  ".repeat(depth) + key + ":",
      Array.isArray(value) ? "" : JSON.stringify(value)
    );
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        prettyPrintAST(value[i], depth + 1);
        if (i + 1 < value.length) {
          console.log();
        }
      }
    }
  }
};

const getTransformProcessor = () =>
  unified()
    .use(parse)
    .use(transform)
    .use(gfm)
    .use(remarkPrettier, { report: false, options: { proseWrap: "always" } });

async function run(html) {
  const file = await getTransformProcessor()
    .use(() => ([node, unhandled]) => {
      console.warn(unhandled);
      prettyPrintAST(node);
      return node;
    })
    .process(encodeKS(html));
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
