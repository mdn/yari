import unified from "unified";
import parse from "remark-parse";
import remark2rehype from "remark-rehype";
import stringify from "rehype-stringify";
import gfm from "remark-gfm";
import raw from "rehype-raw";
import format from "rehype-format";

import * as handlers from "./handlers/index.js";
import { decodeKS, encodeKS } from "../utils/index.js";

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

export async function m2h(md) {
  const ksEncoded = encodeKS(md);
  const processor = makeProcessor();

  const file = await processor.process(ksEncoded);
  return decodeKS(String(file));
}

export function m2hSync(md) {
  const ksEncoded = encodeKS(md);
  const processor = makeProcessor();

  const file = processor.processSync(ksEncoded);
  return decodeKS(String(file));
}
