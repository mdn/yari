import { unified } from "unified";
import parse from "remark-parse";
import rehypeParse from "rehype-parse";
import rehypeRemark from "rehype-remark";
import remarkRehype from "remark-rehype";
import remarkStringify from "remark-stringify";
import stringify from "rehype-stringify";
import gfm from "remark-gfm";
import raw from "rehype-raw";
import format from "rehype-format";

import { buildLocalizedHandlers } from "./handlers/index.js";
import { decodeKS, encodeKS } from "../utils/index.js";
import remarkGfm from "remark-gfm";

interface ProcessorOptions {
  locale?: string;
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

export function h2mSync(html: string) {
  const file = unified()
    .use(rehypeParse)
    .use(rehypeRemark)
    .use(remarkGfm)
    .use(remarkStringify)
    .processSync(html);
  return String(file);
}
