import fs from "node:fs";
import path from "node:path";

import readChunk from "read-chunk";
import imageType from "image-type";
import isSvg from "is-svg";

import { DEFAULT_LOCALE } from "../libs/constants/index.js";
import { ROOTS } from "../libs/env/index.js";
import { memoize, slugToFolder } from "./utils.js";

function isImage(filePath) {
  if (fs.statSync(filePath).isDirectory()) {
    return false;
  }
  if (filePath.toLowerCase().endsWith(".svg")) {
    return isSvg(fs.readFileSync(filePath));
  }
  const buffer = readChunk.sync(filePath, 0, 12);
  if (buffer.length === 0) {
    return false;
  }
  const type = imageType(buffer);
  if (!type) {
    // This happens when there's no match on the "Supported file types"
    // https://github.com/sindresorhus/image-type#supported-file-types
    return false;
  }

  return true;
}

function urlToFilePath(url) {
  const [, locale, , ...slugParts] = decodeURI(url).split("/");
  return path.join(locale.toLowerCase(), slugToFolder(slugParts.join("/")));
}

const find = memoize((relativePath: string) => {
  return ROOTS.map((root) => path.join(root, relativePath)).find(
    (filePath) => fs.existsSync(filePath) && isImage(filePath)
  );
});

export function findByURL(url) {
  return find(urlToFilePath(url));
}

export function findByURLWithFallback(url: string): string {
  let filePath = findByURL(url);
  const urlParts = url.split("/");
  const locale = urlParts[1].toLowerCase();
  if (!filePath && locale !== DEFAULT_LOCALE) {
    urlParts[1] = DEFAULT_LOCALE;
    const defaultLocaleURL = urlParts.join("/");
    filePath = findByURL(defaultLocaleURL);
  }
  return filePath;
}
