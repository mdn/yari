import { join } from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";

import { BUILD_OUT_ROOT } from "../libs/env/index.js";

interface SitemapEntry {
  slug: string;
  modified?: string;
}

export async function buildSitemap(
  entries: SitemapEntry[],
  {
    slugPrefix = "",
    pathSuffix = [],
  }: { slugPrefix?: string; pathSuffix?: string[] }
) {
  const xml = makeSitemapXML(slugPrefix, entries);
  const path = await writeSitemap(xml, ...pathSuffix);

  return path;
}

function makeSitemapXML(prefix: string, docs: SitemapEntry[]) {
  const sortedDocs = docs.slice().sort((a, b) => a.slug.localeCompare(b.slug));

  // Based on https://support.google.com/webmasters/answer/183668?hl=en
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...sortedDocs.map((doc) => {
      const loc = `<loc>https://developer.mozilla.org${prefix}${doc.slug}</loc>`;
      const modified = doc.modified
        ? `<lastmod>${doc.modified.toString().split("T")[0]}</lastmod>`
        : "";
      return `<url>${loc}${modified}</url>`;
    }),
    "</urlset>",
    "",
  ].join("\n");
}

export function makeSitemapIndexXML(paths: string[]) {
  const sortedPaths = paths.slice().sort();

  // Based on https://support.google.com/webmasters/answer/75712
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...sortedPaths.map((path) => {
      return (
        "<sitemap>" +
        `<loc>https://developer.mozilla.org${path}</loc>` +
        `<lastmod>${new Date().toISOString().split("T")[0]}</lastmod>` +
        "</sitemap>"
      );
    }),
    "</sitemapindex>",
  ].join("\n");
}

async function writeSitemap(xml: string, ...paths: string[]) {
  const dirPath = join(
    BUILD_OUT_ROOT,
    "sitemaps",
    ...paths.map((p) => p.toLowerCase())
  );
  await mkdir(dirPath, { recursive: true });

  const filePath = join(dirPath, "sitemap.xml.gz");
  await writeFile(filePath, gzipSync(xml));

  return filePath;
}
