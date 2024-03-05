import fs from "node:fs";
import path from "node:path";

import { fdir, PathsOutput } from "fdir";
import fm from "front-matter";

import { VALID_LOCALES } from "../libs/constants/index.js";
import { CONTENT_ROOT, CONTENT_TRANSLATED_ROOT } from "../libs/env/index.js";
import { SearchIndex } from "../build/index.js";
import { isValidLocale } from "../libs/locale-utils/index.js";

interface DocAttributes {
  locale: string;
  slug: string;
}

function populateSearchIndex(searchIndex, localeLC) {
  const root = path.join(
    localeLC === "en-us" ? CONTENT_ROOT : CONTENT_TRANSLATED_ROOT,
    localeLC
  );
  const locale = VALID_LOCALES.get(localeLC);
  const api = new fdir().withFullPaths().withErrors().crawl(root);
  for (const filePath of api.sync() as PathsOutput) {
    if (!(filePath.endsWith("index.html") || filePath.endsWith("index.md"))) {
      continue;
    }
    const rawContent = fs.readFileSync(filePath, "utf-8");
    const { attributes: metadata } = fm<DocAttributes>(rawContent);
    metadata.locale = locale;

    const url = `/${locale}/docs/${metadata.slug}`;
    const doc = { metadata, url };
    searchIndex.add(doc);
  }
}

export async function searchIndexRoute(req, res) {
  // Remember, this is always in lowercase because of a middleware
  // that lowercases all incoming requests' pathname.
  const locale = req.params.locale;
  if (locale !== "en-us" && !CONTENT_TRANSLATED_ROOT) {
    res.status(500).send("CONTENT_TRANSLATE_ROOT not set\n");
    return;
  }
  if (!isValidLocale(locale)) {
    res.status(500).send(`unrecognized locale ${locale}`);
    return;
  }

  // The advantage of creating the search index over and over on every
  // request is that it can't possible cache itself stale.
  // Imagine if a user just seconds ago created a page, and reaches for
  // the search widget and can't find what they just created.
  // Or perhaps they edited a title and expect that to turn up.

  // However, if this is causing a problem, we can easily turn on some
  // caching. Either `Cache-Control` on the response.
  // Or, we can make this `searchIndex` a module global so it's reused
  // repeatedly until the server is restarted.

  const searchIndex = new SearchIndex();

  const label = "Populate search-index";
  console.time(label);
  populateSearchIndex(searchIndex, locale);
  searchIndex.sort();
  console.timeEnd(label);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.json(searchIndex.getItems()[locale]);
}
