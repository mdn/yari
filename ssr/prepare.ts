import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  ALWAYS_ALLOW_ROBOTS,
  BUILD_OUT_ROOT,
  BASE_URL,
} from "../libs/env/index.js";
import { generateGA } from "./ga.js";

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

function gtagScriptPath(relPath = "/static/js/gtag.js") {
  const filePath = relPath.split("/").slice(1).join(path.sep);
  if (fs.existsSync(path.join(BUILD_OUT_ROOT, filePath))) {
    return relPath;
  }
  return null;
}

function prepare() {
  const webfontURLs = extractWebFontURLs();
  const gtagPath = gtagScriptPath();
  const assetManifest = fs.readFileSync(
    path.join(clientBuildRoot, "asset-manifest.json"),
    "utf-8"
  );

  fs.writeFileSync(
    path.join(dirname, "ssr", "include.ts"),
    `
export const WEBFONT_URLS = ${JSON.stringify(webfontURLs)};
export const GTAG_PATH = ${JSON.stringify(gtagPath)};
export const BASE_URL = ${JSON.stringify(BASE_URL)};
export const ALWAYS_ALLOW_ROBOTS = ${JSON.stringify(ALWAYS_ALLOW_ROBOTS)};
export const ASSET_MANIFEST = ${assetManifest};
`
  );
}

generateGA().then(() => prepare());
