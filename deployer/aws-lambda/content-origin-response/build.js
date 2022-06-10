/* eslint-disable node/no-unpublished-require */
/* eslint-disable node/no-missing-require */
const fs = require("fs");
const fdir = require("fdir");
const dotenv = require("dotenv");
const path = require("path");
const { DEFAULT_LOCALE } = require("@yari-internal/constants");
const locale = DEFAULT_LOCALE.toLowerCase();

const dirname = __dirname;

const root = path.join(dirname, "..", "..", "..");
dotenv.config({
  path: path.join(root, process.env.ENV_FILE || ".env"),
});

function buildImageSet() {
  const contentRoot = "CONTENT_ROOT";
  if (!process.env[contentRoot]) {
    console.error(`Missing ENV variable: ${contentRoot}`);
    return;
  }

  const base = process.env[contentRoot];
  console.log(`${contentRoot} = ${base}`);

  const contentPath = [
    // Absolute path.
    `${base}/${locale}/`,
    `${base}/files/${locale}/`,
    // Relative path.
    `${root}/${base}/${locale}/`,
    `${root}/${base}/files/${locale}/`,
  ].find((path) => fs.existsSync(path));

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

  const output = "fallback-path.json";
  fs.writeFileSync(output, JSON.stringify(imageFiles));

  const count = imageFiles.length;
  const kb = Math.round(fs.statSync(output).size / 1024);
  console.log(`Wrote ${count} asset paths to ${output} in ${kb} KB`);
}

buildImageSet();
