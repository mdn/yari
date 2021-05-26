import * as cheerio from "cheerio";
import * as unified from "unified";
import * as parse from "rehype-parse";
import * as remarkPrettier from "remark-prettier";
import * as gfm from "remark-gfm";
import {
  extractSections,
  extractSummary,
} from "../../build/document-extractor";

import { decodeKS, encodeKS } from "../utils";

import { transform } from "./transform";

const getTransformProcessor = (options) =>
  unified()
    .use(parse)
    .use(transform, options)
    .use(gfm)
    .use(remarkPrettier, { report: false, options: { proseWrap: "always" } });

export async function h2m(html) {
  const encodedHTML = encodeKS(html);
  const summary = extractSummary(
    extractSections(cheerio.load(`<div id="_body">${encodedHTML}</div>`))[0]
  );

  let unhandled;
  const file = await getTransformProcessor({ summary })
    .use(() => ([node, u]: any) => {
      unhandled = u;
      return node;
    })
    .process(encodedHTML);

  return [
    decodeKS(String(file))
      .split("\n")
      .filter((line) => !line.includes("<!-- prettier-ignore -->"))
      .join("\n"),
    unhandled,
  ];
}
