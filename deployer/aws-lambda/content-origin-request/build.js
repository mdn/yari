/* eslint-disable node/no-unpublished-require */
/* eslint-disable node/no-missing-require */
const { DEFAULT_LOCALE, VALID_LOCALES } = require("@yari-internal/constants");
const DEFAULT_LOCALE_LC = DEFAULT_LOCALE.toLowerCase();
const fdir = require("fdir");
const fs = require("fs");
const path = require("path");

const dirname = __dirname;

const dotenv = require("dotenv");
const root = path.join(dirname, "..", "..", "..");
dotenv.config({
  path: path.join(root, process.env.ENV_FILE || ".env"),
});

function getPath(locale) {
  locale = locale.toLowerCase();
  const contentRoot =
    locale === DEFAULT_LOCALE_LC ? "CONTENT_ROOT" : "CONTENT_TRANSLATED_ROOT";
  const base = process.env[contentRoot];
  if (!base) {
    console.error(`Missing ENV variable: ${contentRoot}`);
    return "";
  }
  console.log(`${contentRoot} = ${base}`);

  const contentPath = [
    // Absolute path.
    `${base}/${locale}/`,
    `${base}/files/${locale}/`,
    // Relative path.
    `${root}/${base}/${locale}/`,
    `${root}/${base}/files/${locale}/`,
  ].find((path) => fs.existsSync(path));

  return contentPath;
}

function buildRedirectsMap() {
  const redirectMap = new Map();

  for (const locale of VALID_LOCALES.keys()) {
    const path = getPath(locale);

    if (path) {
      const content = fs.readFileSync(path, "utf-8");
      const lines = content.split("\n");
      const redirectLines = lines.filter(
        (line) => line.startsWith("/") && line.includes("\t")
      );
      for (const redirectLine of redirectLines) {
        const [source, target] = redirectLine.split("\t", 2);
        redirectMap.set(source.toLowerCase(), target);
      }
      console.log(`- ${path}: ${redirectLines.length} redirects`);
    }
  }

  const output = "redirects.json";

  fs.writeFileSync(output, JSON.stringify(Object.fromEntries(redirectMap)));

  const count = redirectMap.size;
  const kb = Math.round(fs.statSync(output).size / 1024);
  console.log(`Wrote ${count} redirects in ${kb} KB.`);
}

function buildImageFallbackSet() {
  const contentPath = getPath(DEFAULT_LOCALE);
  if (!contentPath) {
    return;
  }

  // Find all images in the default locale.
  const baseDir = path.resolve(contentPath);
  const api = new fdir.fdir()
    .withFullPaths()
    .withErrors()
    .filter((filePath) => {
      return (
        !filePath.endsWith(".md") &&
        !filePath.endsWith(".html") &&
        path.dirname(filePath) !== baseDir
      );
    })
    .crawl(contentPath);
  const imageFiles = [...api.sync()].map((filePath) =>
    path.relative(contentPath, filePath)
  );

  // check if the image is also in l10n locales,
  // if not, add it to the fallback paths.
  const sets = new Set();
  for (const locale of VALID_LOCALES.keys()) {
    if (locale === DEFAULT_LOCALE_LC) {
      continue;
    }
    const translatedPath = getPath(locale);
    if (!translatedPath) {
      continue;
    }
    const translatedBaseDir = path.resolve(translatedPath);
    for (const filePath of imageFiles) {
      const translatedFile = path.join(translatedBaseDir, filePath);
      if (!fs.existsSync(translatedFile)) {
        sets.add(`/${locale}/docs/${filePath}`); // match the uri in aws lambda: `/${locale}/docs/path/to/file`
      }
    }
  }

  const output = "fallback-paths.json";
  fs.writeFileSync(output, JSON.stringify(Array.from(sets)));

  const count = sets.size;
  const kb = Math.round(fs.statSync(output).size / 1024);
  console.log(`Wrote ${count} image fallback paths to ${output} in ${kb} KB`);
}

buildRedirectsMap();
buildImageFallbackSet();
