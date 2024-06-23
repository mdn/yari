import { readFile, stat, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import * as dotenv from "dotenv";

import { normalizePath } from "./utils.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const root = join(__dirname, "..", "..");
dotenv.config({
  path: join(root, process.env["ENV_FILE"] || ".env"),
});

async function buildCanonicals() {
  const { BUILD_OUT_ROOT = join(root, "client", "build") } = process.env;

  const sitemapPath = join(BUILD_OUT_ROOT, "sitemap.txt");

  const content = await readFile(sitemapPath, "utf-8");
  const lines = content.split("\n");
  const pages = lines.filter((line) => line.startsWith("/"));

  const siteMap: Record<string, string> = {};
  for (const page of pages) {
    siteMap[normalizePath(page)] = page;
  }
  console.log(`- ${sitemapPath}: ${pages.length} pages`);

  const output = "canonicals.json";

  await writeFile(output, JSON.stringify(siteMap));

  const count = Object.keys(siteMap).length;
  const kb = Math.round((await stat(output)).size / 1024);
  console.log(`Wrote ${count} pages in ${kb} KB.`);
}

await buildCanonicals();
