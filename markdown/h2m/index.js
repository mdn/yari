import cheerio from "cheerio";
import unified from "unified";
import parseHTML from "rehype-parse";
import gfm from "remark-gfm";
import remarkPrettier from "remark-prettier";
import {
  extractSections,
  extractSummary,
} from "@mdn/yari/build/document-extractor.js";

import { decodeKS, encodeKS, prettyAST } from "../utils/index.js";
import { transform } from "./transform.js";

const getTransformProcessor = (options) =>
  unified()
    .use(parseHTML)
    .use(transform, options)
    .use(gfm)
    .use(remarkPrettier, {
      report: false,
      options: { embeddedLanguageFormatting: "off" },
    });

export async function h2m(html, { printAST, locale } = {}) {
  const encodedHTML = encodeKS(html);
  const summary = extractSummary(
    extractSections(cheerio.load(`<div id="_body">${encodedHTML}</div>`))[0]
  );

  let unhandled;
  let invalid;
  const file = await getTransformProcessor({ summary, locale })
    .use(() => (result) => {
      invalid = result.invalid;
      unhandled = result.unhandled;
      if (printAST) {
        console.info(prettyAST(result.transformed));
      }
      return result.transformed;
    })
    .process(encodedHTML);

  const result = String(file);

  return [decodeKS(result), { invalid, unhandled }];
}
