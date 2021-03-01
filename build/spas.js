const fs = require("fs");
const path = require("path");

const { CONTENT_ROOT, CONTENT_TRANSLATED_ROOT } = require("../content");
const {
  BUILD_OUT_ROOT,
  HOMEPAGE_FEED_URL,
  HOMEPAGE_FEED_DISPLAY_MAX,
} = require("./constants");
const { getFeedEntries } = require("./feedparser");
// eslint-disable-next-line node/no-missing-require
const { renderHTML } = require("../ssr/dist/main");

async function buildSPAs(options) {
  let buildCount = 0;

  // The URL isn't very important as long as it triggers the right route in the <App/>
  const url = "/en-US/404.html";
  const html = renderHTML(url, { pageNotFound: true });
  const outPath = path.join(BUILD_OUT_ROOT, "en-us", "_spas");
  fs.mkdirSync(outPath, { recursive: true });
  fs.writeFileSync(path.join(outPath, path.basename(url)), html);
  buildCount++;
  if (options.verbose) {
    console.log("Wrote", path.join(outPath, path.basename(url)));
  }

  // Basically, this builds one `search/index.html` for every locale we intend
  // to build.
  for (const root of [CONTENT_ROOT, CONTENT_TRANSLATED_ROOT]) {
    if (!root) {
      continue;
    }
    for (const locale of fs.readdirSync(root)) {
      if (!fs.statSync(path.join(root, locale)).isDirectory()) {
        continue;
      }
      const url = `/${locale}/search`;
      const html = renderHTML(url);
      const outPath = path.join(BUILD_OUT_ROOT, locale, "search");
      fs.mkdirSync(outPath, { recursive: true });
      const filePath = path.join(outPath, "index.html");
      fs.writeFileSync(filePath, html);
      buildCount++;
      if (options.verbose) {
        console.log("Wrote", filePath);
      }
    }
  }

  // Build all the home pages in all locales.
  // Have the feed entries ready before building the home pages.
  // XXX disk caching?
  const feedEntries = (await getFeedEntries(HOMEPAGE_FEED_URL)).slice(
    0,
    HOMEPAGE_FEED_DISPLAY_MAX
  );
  for (const root of [CONTENT_ROOT, CONTENT_TRANSLATED_ROOT]) {
    if (!root) {
      continue;
    }
    for (const locale of fs.readdirSync(root)) {
      if (!fs.statSync(path.join(root, locale)).isDirectory()) {
        continue;
      }
      const url = `/${locale}/`;
      // Each .pubDate in feedEntries is a Date object. That has to be converted
      // to a string. That way the SSR rendering is
      const dateFormatter = new Intl.DateTimeFormat(locale, {
        dateStyle: "full",
      });
      const context = {
        feedEntries: feedEntries.map((entry) => {
          const pubDateString = dateFormatter.format(entry.pubDate);
          return Object.assign({}, entry, { pubDate: pubDateString });
        }),
      };
      const html = renderHTML(url, context);
      const outPath = path.join(BUILD_OUT_ROOT, locale);
      fs.mkdirSync(outPath, { recursive: true });
      const filePath = path.join(outPath, "index.html");
      fs.writeFileSync(filePath, html);
      buildCount++;
      if (options.verbose) {
        console.log("Wrote", filePath);
      }
      // Also, dump the feed entries as a JSON file so the data can be gotten
      // in client-side rendering.
      const filePathContext = path.join(outPath, "index.json");
      fs.writeFileSync(filePathContext, JSON.stringify(context));
      buildCount++;
      if (options.verbose) {
        console.log("Wrote", filePathContext);
      }
    }
  }
  if (!options.quiet) {
    console.log(`Built ${buildCount} SPA files`);
  }
}

module.exports = { buildSPAs };
