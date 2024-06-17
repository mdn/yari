import { unified } from "unified";
import parse from "remark-parse";
import remarkRehype from "remark-rehype";
import stringify from "rehype-stringify";
import gfm from "remark-gfm";
import raw from "rehype-raw";
import format from "rehype-format";

import { buildLocalizedHandlers } from "./handlers/index.js";
import { decodeKS, encodeKS } from "../utils/index.js";
import { Locale } from "../../libs/types/core.js";

interface ProcessorOptions {
  locale?: Locale;
}

function makeProcessor(options: ProcessorOptions) {
  const localizedHandlers = buildLocalizedHandlers(options.locale);
  const processor = unified()
    .use(parse)
    .use(gfm)
    .use(remarkRehype, {
      handlers: localizedHandlers,
      allowDangerousHtml: true,
    })
    .use(raw)
    .use(stringify, { allowDangerousHtml: true })
    .use(format);

  return processor;
}

export async function m2h(md: string, options: ProcessorOptions) {
  const ksEncoded = encodeKS(md);
  const processor = makeProcessor(options);

  const file = await processor.process(ksEncoded);
  return decodeKS(String(file));
}

export function m2hSync(md: string, options: ProcessorOptions) {
  const ksEncoded = encodeKS(md);
  const processor = makeProcessor(options);

  const file = processor.processSync(ksEncoded);
  return decodeKS(String(file));
}
