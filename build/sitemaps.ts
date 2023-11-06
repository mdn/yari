export function makeSitemapXML(
  locale: string,
  docs: { slug: string; modified: string }[]
) {
  const sortedDocs = docs.slice().sort((a, b) => a.slug.localeCompare(b.slug));

  // Based on https://support.google.com/webmasters/answer/183668?hl=en
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...sortedDocs.map((doc) => {
      const loc = `<loc>https://developer.mozilla.org/${locale}/docs/${doc.slug}</loc>`;
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
