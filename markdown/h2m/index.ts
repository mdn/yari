import * as cheerio from "cheerio";
import * as unified from "unified";
import * as parseHTML from "rehype-parse";
import * as gfm from "remark-gfm";
import * as parseMD from "remark-parse";
import * as remarkPrettier from "remark-prettier";
import * as stringify from "remark-stringify";
import {
  extractSections,
  extractSummary,
} from "../../build/document-extractor";

import { decodeKS, encodeKS, prettyAST } from "../utils";
import { MDNodeUnion } from "./h";
import { transform } from "./transform";

const getTransformProcessor = (options) =>
  unified()
    .use(parseHTML)
    .use(transform, options)
    .use(gfm)
    .use(remarkPrettier, { report: false, options: { proseWrap: "always" } });

const stripPrettierIgnore = (node: MDNodeUnion) => ({
  ...node,
  ...(Array.isArray(node.children)
    ? {
        children: node.children
          .filter(
            (node) =>
              !(
                node.type == "html" &&
                node.value.trim() == "<!-- prettier-ignore -->"
              )
          )
          .map((node) => stripPrettierIgnore(node)),
      }
    : {}),
});

const stripPrettierIgnoreProcesser = unified()
  .use(parseMD)
  .use(() => (result: any) => stripPrettierIgnore(result))
  .use(stringify);

export async function h2m(html, { printAST }: { printAST?: boolean } = {}) {
  const encodedHTML = encodeKS(html);
  const summary = extractSummary(
    extractSections(cheerio.load(`<div id="_body">${encodedHTML}</div>`))[0]
  );

  let unhandled;
  let invalid;
  const file = await getTransformProcessor({ summary })
    .use(() => (result: any) => {
      invalid = result.invalid;
      unhandled = result.unhandled;
      if (printAST) {
        console.log(prettyAST(result.transformed));
      }
      return result.transformed;
    })
    .process(encodedHTML);

  const result = String(
    await stripPrettierIgnoreProcesser.process(String(file))
  );

  return [decodeKS(result), { invalid, unhandled }];
}
