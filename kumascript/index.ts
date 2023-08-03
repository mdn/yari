import { LRUCache } from "lru-cache";
import * as cheerio from "cheerio";

import { Document } from "../content/index.js";
import { m2h } from "../markdown/index.js";

import info from "./src/info.js";
import { render as renderMacros } from "./src/render.js";
import { HTMLTool } from "./src/api/util.js";
import { DEFAULT_LOCALE } from "../libs/constants/index.js";
import {
  INTERACTIVE_EXAMPLES_BASE_URL,
  LEGACY_LIVE_SAMPLES_BASE_URL,
  LIVE_SAMPLES_BASE_URL,
} from "../libs/env/index.js";
import { SourceCodeError } from "./src/errors.js";
import { Doc } from "../libs/types/document.js";
export { buildLiveSamplePages } from "./src/live-sample.js";

const DEPENDENCY_LOOP_INTRO =
  'The following documents form a circular dependency when rendering (via the "page" macros):';

export const renderCache = new LRUCache<string, [string, SourceCodeError[]]>({
  max: 2000,
});

interface RenderOptions {
  urlsSeen?: Set<string>;
  selective_mode?: [string, string[]] | false;
  invalidateCache?: boolean;
}

export async function render(
  url: string,
  {
    urlsSeen = null,
    selective_mode = false,
    invalidateCache = false,
  }: RenderOptions = {},
  doc?: Doc
): Promise<[cheerio.CheerioAPI, SourceCodeError[]]> {
  const urlLC = url.toLowerCase();
  if (renderCache.has(urlLC)) {
    if (invalidateCache) {
      renderCache.delete(urlLC);
    } else {
      const [renderedHtml, errors] = renderCache.get(urlLC);
      return [cheerio.load(renderedHtml), errors];
    }
  }

  urlsSeen = urlsSeen || new Set([]);
  if (urlsSeen.has(urlLC)) {
    throw new Error(
      `${DEPENDENCY_LOOP_INTRO}\n${[...urlsSeen, url].join(" ⭢ ")}`
    );
  }
  urlsSeen.add(urlLC);
  const prerequisiteErrorsByKey = new Map();
  const document =
    (doc as any) ||
    (invalidateCache
      ? Document.findByURL(url, Document.MEMOIZE_INVALIDATE)
      : Document.findByURL(url));
  if (!document) {
    throw new Error(
      `From URL ${url} no folder on disk could be found. ` +
        `Tried to find a folder called ${Document.urlToFolderPath(url)}`
    );
  }
  let { metadata } = document;
  // If we're rendering a translation, merge in the parent document's
  // metadata into this metadata.
  if (metadata.locale !== DEFAULT_LOCALE) {
    const parentURL = url
      .toLowerCase()
      .replace(`/${metadata.locale.toLowerCase()}/`, `/${DEFAULT_LOCALE}/`);

    const parentDocument = invalidateCache
      ? Document.findByURL(parentURL, Document.MEMOIZE_INVALIDATE)
      : Document.findByURL(parentURL);
    if (parentDocument) {
      metadata = { ...parentDocument.metadata, ...metadata };
    }
  }

  const { rawBody, fileInfo, isMarkdown } = document;
  const rawHTML = isMarkdown
    ? await m2h(rawBody, { locale: metadata.locale })
    : rawBody;
  const [renderedHtml, errors] = await renderMacros(
    rawHTML,
    {
      ...metadata,
      url,
      tags: metadata.tags || [],
      selective_mode,
      interactive_examples: {
        base_url: INTERACTIVE_EXAMPLES_BASE_URL,
      },
      live_samples: {
        base_url: LIVE_SAMPLES_BASE_URL || url,
        legacy_url: LEGACY_LIVE_SAMPLES_BASE_URL || url,
      },
    },
    async (url) => {
      const [renderedHtml, errors] = await render(info.cleanURL(url), {
        urlsSeen,
      });
      // Remove duplicate flaws. During the rendering process, it's possible for identical
      // flaws to be introduced when different dependency paths share common prerequisites.
      // For example, document A may have prerequisite documents B and C, and in turn,
      // document C may also have prerequisite B, and the rendering of document B generates
      // one or more flaws.
      for (const error of errors) {
        prerequisiteErrorsByKey.set(error.key, error);
      }
      return renderedHtml;
    }
  );

  // For now, we're just going to inject section ID's.
  // TODO: Sanitize the HTML and also filter the "src"
  //       attributes of any iframes.
  const tool = new HTMLTool(renderedHtml);
  tool.injectSectionIDs();
  const allErrors = [...prerequisiteErrorsByKey.values()].concat(
    errors.map((e) => e.updateFileInfo(fileInfo))
  );
  if (urlsSeen?.size > 1) {
    // This means we recursed so let's cache this
    renderCache.set(urlLC, [
      tool.html(),
      // The prerequisite errors have already been updated with their own file information.
      allErrors,
    ]);
  }
  return [tool.cheerio(), allErrors];
}
