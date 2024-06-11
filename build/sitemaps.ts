import { join } from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";

import { fdir } from "fdir";

import { BASE_URL, BUILD_OUT_ROOT } from "../libs/env/index.js";

const SITEMAP_BASE_URL = BASE_URL.replace(/\/$/, "");

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
  const txt = entries.map(({ slug }) => `${slugPrefix}${slug}`).join("\n");
  const xml = makeSitemapXML(slugPrefix, entries);

  const dirPath = join(
    BUILD_OUT_ROOT,
    "sitemaps",
    ...pathSuffix.map((p) => p.toLowerCase())
  );
  await mkdir(dirPath, { recursive: true });

  const txtPath = join(dirPath, "sitemap.txt");
  const xmlPath = join(dirPath, "sitemap.xml.gz");

  await Promise.all([
    writeFile(txtPath, txt, "utf-8"),
    writeFile(xmlPath, gzipSync(xml)),
  ]);

  return xmlPath;
}

export async function buildSitemapIndex() {
  const txtSitemaps = new fdir()
    .filter((p) => p.endsWith("/sitemap.txt"))
    .withFullPaths()
    .crawl(join(BUILD_OUT_ROOT, "sitemaps"))
    .sync();

  const xmlSitemaps = new fdir()
    .filter((p) => p.endsWith("/sitemap.xml.gz"))
    .withFullPaths()
    .crawl(join(BUILD_OUT_ROOT, "sitemaps"))
    .sync()
    .sort()
    .map((fp) => fp.replace(BUILD_OUT_ROOT, ""));

  const txtPath = join(BUILD_OUT_ROOT, "sitemap.txt");
  const xmlPath = join(BUILD_OUT_ROOT, "sitemap.xml");

  await Promise.all([
    makeSitemapIndexTXT(txtSitemaps).then((content) =>
      writeFile(txtPath, content, "utf-8")
    ),
    writeFile(xmlPath, makeSitemapIndexXML(xmlSitemaps)),
  ]);

  return xmlSitemaps.sort().map((fp) => fp.replace(BUILD_OUT_ROOT, ""));
}

function makeSitemapXML(prefix: string, docs: SitemapEntry[]) {
  const sortedDocs = docs.slice().sort((a, b) => a.slug.localeCompare(b.slug));

  // Based on https://support.google.com/webmasters/answer/183668?hl=en
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...sortedDocs.map((doc) => {
      const loc = `<loc>${SITEMAP_BASE_URL}${prefix}${doc.slug}</loc>`;
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
        `<loc>${SITEMAP_BASE_URL}${path}</loc>` +
        `<lastmod>${new Date().toISOString().split("T")[0]}</lastmod>` +
        "</sitemap>"
      );
    }),
    "</sitemapindex>",
  ].join("\n");
}

/**
 * Creates a global text sitemap by merging all text sitemaps.
 */
export async function makeSitemapIndexTXT(paths: string[]) {
  const maps = await Promise.all(paths.map((p) => readFile(p, "utf-8")));

  const urls = maps.join("\n").split("\n").filter(Boolean);

  return urls.sort().join("\n");
}
