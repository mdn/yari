// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module 'cheerio'. Did you mean to set ... Remove this comment to see the full error message
import * as cheerio from "cheerio";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module 'unified'. Did you mean to set ... Remove this comment to see the full error message
import * as unified from "unified";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module 'rehype-parse'. Did you mean to... Remove this comment to see the full error message
import * as parseHTML from "rehype-parse";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module 'remark-gfm'. Did you mean to s... Remove this comment to see the full error message
import * as gfm from "remark-gfm";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module 'remark-prettier'. Did you mean... Remove this comment to see the full error message
import * as remarkPrettier from "remark-prettier";
import {
  extractSections,
  extractSummary,
  // @ts-expect-error ts-migrate(2306) FIXME: File '/Users/claas/github/mdn/yari/build/document-... Remove this comment to see the full error message
} from "../../build/document-extractor";

// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module '../utils'. Did you mean to set... Remove this comment to see the full error message
import { decodeKS, encodeKS, prettyAST } from "../utils";
import { transform } from "./transform";

const getTransformProcessor = (options) =>
  unified()
    .use(parseHTML)
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
