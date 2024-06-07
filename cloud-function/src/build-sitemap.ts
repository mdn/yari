import { readFile, stat, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import * as dotenv from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));

const root = join(__dirname, "..", "..");
dotenv.config({
  path: join(root, process.env["ENV_FILE"] || ".env"),
});

async function buildSitemap() {
  const siteMap = new Map<string, string>();

  const { BUILD_OUT_ROOT = join(root, "client", "build") } = process.env;

  const sitemapPath = join(BUILD_OUT_ROOT, "sitemap.txt");

  const content = await readFile(sitemapPath, "utf-8");
  const lines = content.split("\n");
  const pages = lines.filter((line) => line.startsWith("/"));

  for (const page of pages) {
    siteMap.set(page.toLowerCase().replace(/\/$/, ""), page);
  }
  console.log(`- ${sitemapPath}: ${pages.length} pages`);

  const output = "sitemap.json";

  await writeFile(output, JSON.stringify(Object.fromEntries(siteMap)));

  const count = siteMap.size;
  const kb = Math.round((await stat(output)).size / 1024);
  console.log(`Wrote ${count} pages in ${kb} KB.`);
}

await buildSitemap();
