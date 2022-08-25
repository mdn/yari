/* eslint-disable node/no-unpublished-require */
/* eslint-disable node/no-missing-require */
const { DEFAULT_LOCALE, VALID_LOCALES } = require("@yari-internal/constants");
const DEFAULT_LOCALE_LC = DEFAULT_LOCALE.toLowerCase();
const { LOCALE_MASK } = require("./mask");
const fdir = require("fdir");
const fs = require("fs");
const path = require("path");

const dirname = __dirname;

const dotenv = require("dotenv");
const root = path.join(dirname, "..", "..", "..");
dotenv.config({
  path: path.join(root, process.env.ENV_FILE || ".env"),
});

function getRoot(key) {
  let base = process.env[key];
  if (!base) {
    console.error(`Missing ENV variable: ${key}`);
    return "";
  }
  console.log(`${key} = ${base}`);

  if (path.basename(base) !== "files") {
    base = path.join(base, "files");
  }

  const contentPath = [
    // Absolute path.
    `${base}/`,
    // Relative path.
    `${root}/${base}/`,
  ].find((path) => fs.existsSync(path));

  return contentPath;
}

const CONTENT_ROOT = getRoot("CONTENT_ROOT");
const CONTENT_TRANSLATED_ROOT = getRoot("CONTENT_TRANSLATED_ROOT");

function buildRedirectsMap() {
  const redirectMap = new Map();

  for (const locale of VALID_LOCALES.keys()) {
    let filepath =
      locale === DEFAULT_LOCALE_LC ? CONTENT_ROOT : CONTENT_TRANSLATED_ROOT;

    if (filepath) {
      filepath = path.join(filepath, locale, "_redirects.txt");
      if (!fs.existsSync(filepath)) {
        continue;
      }
      const content = fs.readFileSync(filepath, "utf-8");
      const lines = content.split("\n");
      const redirectLines = lines.filter(
        (line) => line.startsWith("/") && line.includes("\t")
      );
      for (const redirectLine of redirectLines) {
        const [source, target] = redirectLine.split("\t", 2);
        redirectMap.set(source.toLowerCase(), target);
      }
      console.log(`- ${filepath}: ${redirectLines.length} redirects`);
    }
  }

  const output = "redirects.json";

  fs.writeFileSync(output, JSON.stringify(Object.fromEntries(redirectMap)));

  const count = redirectMap.size;
  const kb = Math.round(fs.statSync(output).size / 1024);
  console.log(`Wrote ${count} redirects in ${kb} KB.`);
}

function buildImageFallbackSet() {
  if (!CONTENT_ROOT || !CONTENT_TRANSLATED_ROOT) {
    return;
  }

  // Find all images in the default locale.
  const contentPath = path.join(CONTENT_ROOT, DEFAULT_LOCALE_LC);
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
  const notExistedmap = new Map();
  const translatedLocale = [...VALID_LOCALES.keys()].filter(
    (locale) => locale !== DEFAULT_LOCALE_LC
  );

  const translatedRootBaseDir = path.resolve(CONTENT_TRANSLATED_ROOT);

  for (const imageFile of imageFiles) {
    let NotExistedLocaleMask = translatedLocale
      .filter((locale) => {
        const translatedImageFile = path.join(
          translatedRootBaseDir,
          locale,
          imageFile
        );
        return !fs.existsSync(translatedImageFile);
      })
      .map((locale) => LOCALE_MASK.get(locale))
      .reduce((x, y) => x + y, 0);

    // only add the image to the fallback paths if it is not in some locales.
    if (NotExistedLocaleMask) {
      notExistedmap.set(`docs/${imageFile}`, NotExistedLocaleMask);
    }
  }

  const output = "fallback-paths.json";
  fs.writeFileSync(output, JSON.stringify(Object.fromEntries(notExistedmap)));

  const count = notExistedmap.size;
  const kb = Math.round(fs.statSync(output).size / 1024);
  console.log(`Wrote ${count} image fallback paths to ${output} in ${kb} KB`);
}

buildRedirectsMap();
buildImageFallbackSet();
