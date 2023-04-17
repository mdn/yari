import { createRequire } from "node:module";

import type express from "express";
import { decodePath } from "../internal/slug-utils/index.js";

import { THIRTY_DAYS } from "../constants.js";
import { redirect } from "../utils.js";

const require = createRequire(import.meta.url);
const REDIRECTS = require("../../redirects.json");
const REDIRECT_SUFFIXES = ["/index.json", "/bcd.json", ""];

export async function redirectMovedPages(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  // Important: The requestURI may be URI-encoded.
  // Example:
  // - Encoded: /zh-TW/docs/AJAX:%E4%B8%8A%E6%89%8B%E7%AF%87
  // - Decoded: /zh-TW/docs/AJAX:上手篇
  const decodedUri = decodePath(req.path);
  const decodedUriLC = decodedUri.toLowerCase();

  // Redirect moved pages (see `_redirects.txt` in content/translated-content).
  // Example:
  // - Source: /zh-TW/docs/AJAX:上手篇
  // - Target: /zh-TW/docs/Web/Guide/AJAX/Getting_Started
  for (const suffix of REDIRECT_SUFFIXES) {
    if (!decodedUriLC.endsWith(suffix)) {
      continue;
    }
    const source = decodedUriLC.substring(
      0,
      decodedUriLC.length - suffix.length
    );
    if (typeof REDIRECTS[source] == "string") {
      const target = REDIRECTS[source] + suffix;
      return redirect(res, target, {
        status: 301,
        cacheControlSeconds: THIRTY_DAYS,
      });
    }
  }

  next();
}
