import unified from "unified";
import parse from "remark-parse";
import remark2rehype from "remark-rehype";
import stringify from "rehype-stringify";
import gfm from "remark-gfm";
import raw from "rehype-raw";
import format from "rehype-format";

import { buildLocalizedHandlers } from "./handlers/index.js";
import { decodeKS, encodeKS } from "../utils/index.js";

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

export { m2h, m2hSync };
