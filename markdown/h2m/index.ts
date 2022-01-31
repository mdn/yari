import * as cheerio from "cheerio";
import { unified } from "unified";
import rehypeParse from "rehype-parse";
import * as gfm from "remark-gfm";
import * as remarkPrettier from "remark-prettier";
import {
  extractSections,
  extractSummary,
} from "../../build/document-extractor";

const { decodeKS, encodeKS, prettyAST } = require("../utils/index.cjs");
import { transform } from "./transform";

const getTransformProcessor = (options) =>
  unified()
    .use(rehypeParse)
    .use(transform, options)
    .use(gfm)
    .use(remarkPrettier, {
      report: false,
      options: { embeddedLanguageFormatting: "off", proseWrap: "preserve" },
    });

export async function h2m(
  html,
  { printAST, locale }: { printAST?: boolean; locale?: string } = {}
) {
  const encodedHTML = encodeKS(html);
  const summary = extractSummary(
    extractSections(cheerio.load(`<div id="_body">${encodedHTML}</div>`))[0]
  );

  let unhandled;
  let invalid;
  const file = await getTransformProcessor({ summary, locale })
    .use(() => (result: any) => {
      invalid = result.invalid;
      unhandled = result.unhandled;
      if (printAST) {
        console.log(prettyAST(result.transformed));
      }
      return result.transformed;
    })
    .process(encodedHTML);

  const result = String(file);

  return [decodeKS(result), { invalid, unhandled }];
}
