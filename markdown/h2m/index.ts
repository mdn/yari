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
    .use(remarkPrettier, { report: false });

function findPrettierIgnoreRanges(node: MDNodeUnion): [number, number][] {
  const ignoreRanges = [];
  if (Array.isArray(node.children)) {
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      const nextChild = node.children[i + 1];
      if (
        child.type == "html" &&
        child.value.trim() == "<!-- prettier-ignore -->" &&
        nextChild
      ) {
        ignoreRanges.push([
          child.position.start.offset,
          nextChild.position.start.offset,
        ]);
      }
      ignoreRanges.push(...findPrettierIgnoreRanges(child));
    }
  }
  return ignoreRanges;
}

async function stripPrettierIgnoreRanges(source: string) {
  let ast;
  const parse = unified()
    .use(parseMD)
    .use(() => (result: any) => {
      ast = result;
      return result;
    })
    .use(stringify);

  await parse.process(source);

  let cutCount = 0;
  for (const [start, end] of findPrettierIgnoreRanges(ast)) {
    source = source.slice(0, start - cutCount) + source.slice(end - cutCount);
    cutCount += end - start;
  }

  return source;
}

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

  const result = await stripPrettierIgnoreRanges(String(file));

  return [decodeKS(result), { invalid, unhandled }];
}
