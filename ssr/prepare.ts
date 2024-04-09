import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  ALWAYS_ALLOW_ROBOTS,
  BUILD_OUT_ROOT,
  BASE_URL,
} from "../libs/env/index.js";

const dirname = path.dirname(fileURLToPath(new URL(".", import.meta.url)));
const clientBuildRoot = path.resolve(dirname, "client/build");

function extractWebFontURLs() {
  const urls: string[] = [];
  const manifest = JSON.parse(
    fs.readFileSync(path.join(clientBuildRoot, "asset-manifest.json"), "utf-8")
  );
  for (const entrypoint of manifest.entrypoints) {
    if (!entrypoint.endsWith(".css")) continue;
    const css = fs.readFileSync(
      path.join(clientBuildRoot, entrypoint),
      "utf-8"
    );
    const generator = extractCSSURLs(css, (url) => url.endsWith(".woff2"));
    urls.push(...generator);
  }
  return [...new Set(urls)];
}

function* extractCSSURLs(css, filterFunction) {
  for (const match of css.matchAll(/url\((.*?)\)/g)) {
    const url = match[1];
    if (filterFunction(url)) {
      yield url;
    }
  }
}

function webfontTags(webfontURLs): string {
  return webfontURLs
    .map(
      (url) => `<link rel="preload" as="font" type="font/woff2" href="${url}">`
    )
    .join("");
}

function gtagScriptPath(relPath = "/static/js/gtag.js") {
  // Return the relative path if there exists a `BUILD_ROOT/static/js/gtag.js`.
  // If the file doesn't exist, return falsy.
  // Remember, unless explicitly set, the BUILD_OUT_ROOT defaults to a path
  // based on `dirname` but that's wrong when compared as a source and as
  // a webpack built asset. So we need to remove the `/ssr/` portion of the path.
  let root = BUILD_OUT_ROOT;
  if (!fs.existsSync(root)) {
    root = root
      .split(path.sep)
      .filter((x) => x !== "ssr")
      .join(path.sep);
  }
  const filePath = relPath.split("/").slice(1).join(path.sep);
  if (fs.existsSync(path.join(root, filePath))) {
    return relPath;
  }
  return null;
}

function prepare() {
  const webfontURLs = extractWebFontURLs();
  const tags = webfontTags(webfontURLs);
  const gtagPath = gtagScriptPath();

  fs.writeFileSync(
    "include.ts",
    `
export const WEBFONT_TAGS = ${JSON.stringify(tags)};
export const GTAG_PATH = ${JSON.stringify(gtagPath)};
export const BASE_URL = ${JSON.stringify(BASE_URL)};
export const ALWAYS_ALLOW_ROBOTS = ${JSON.stringify(ALWAYS_ALLOW_ROBOTS)};
`
  );
}

prepare();
