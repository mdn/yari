import { createRequire } from "node:module";

import { NextFunction, Request, Response } from "express";

import { THIRTY_DAYS } from "../constants.js";
import { normalizeSlug, redirect } from "../utils.js";

const require = createRequire(import.meta.url);
const REDIRECTS = require("../../sitemap.json");
const REDIRECT_SUFFIXES = ["/index.json", "/bcd.json", ""];

export async function redirectNonCanonicals(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const parsedUrl = new URL(req.url, `${req.protocol}://${req.headers.host}/`);
  const { pathname } = parsedUrl;

  // Redirect to canonical version.
  // Example:
  // - Source: /en-US/docs/web/guide/ajax/getting_started
  // - Target: /en-US/docs/Web/Guide/AJAX/Getting_Started
  for (const suffix of REDIRECT_SUFFIXES) {
    if (!pathname.endsWith(suffix)) {
      continue;
    }
    const originalSource = pathname.substring(
      0,
      pathname.length - suffix.length
    );
    const source = normalizeSlug(originalSource);
    if (typeof REDIRECTS[source] == "string" && REDIRECTS[source] !== source) {
      const target = REDIRECTS[source] + suffix + parsedUrl.search;
      return redirect(res, target, {
        status: 301,
        cacheControlSeconds: THIRTY_DAYS,
      });
    }
  }

  next();
}
