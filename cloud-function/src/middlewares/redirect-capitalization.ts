import { createRequire } from "node:module";

import { NextFunction, Request, Response } from "express";

import { decodePath } from "@yari-internal/slug-utils";
import { THIRTY_DAYS } from "../constants.js";
import { normalizeSlug, redirect } from "../utils.js";

const require = createRequire(import.meta.url);
const REDIRECTS = require("../../sitemap.json");
const REDIRECT_SUFFIXES = ["/index.json", "/bcd.json", ""];

export async function redirectCapitalization(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Important: The requestURI may be URI-encoded.
  // Example:
  // - Encoded: /zh-TW/docs/AJAX:%E4%B8%8A%E6%89%8B%E7%AF%87
  // - Decoded: /zh-TW/docs/AJAX:上手篇
  const decodedUri = decodePath(req.path);
  const decodedUriLC = decodedUri.toLowerCase();

  // Redirect to canonical version.
  // Example:
  // - Source: /en-US/docs/web/guide/ajax/getting_started
  // - Target: /en-US/docs/Web/Guide/AJAX/Getting_Started
  for (const suffix of REDIRECT_SUFFIXES) {
    if (!decodedUriLC.endsWith(suffix)) {
      continue;
    }
    const originalSource = decodedUriLC.substring(
      0,
      decodedUriLC.length - suffix.length
    );
    const source = normalizeSlug(originalSource);
    if (typeof REDIRECTS[source] == "string" && REDIRECTS[source] !== source) {
      const target = REDIRECTS[source] + suffix;
      return redirect(res, target, {
        status: 301,
        cacheControlSeconds: THIRTY_DAYS,
      });
    }
  }

  next();
}
