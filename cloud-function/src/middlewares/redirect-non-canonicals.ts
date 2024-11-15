import { NextFunction, Request, Response } from "express";

import { THIRTY_DAYS } from "../constants.js";
import { normalizePath, redirect } from "../utils.js";
import { CANONICALS } from "../canonicals.js";

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
    const source = normalizePath(originalSource);
    if (
      typeof CANONICALS[source] == "string" &&
      CANONICALS[source] !== originalSource
    ) {
      const target = joinPath(CANONICALS[source], suffix) + parsedUrl.search;
      if (pathname !== target) {
        return redirect(res, target, {
          status: 301,
          cacheControlSeconds: THIRTY_DAYS,
        });
      }
    }
  }

  next();
}

function joinPath(a: string, b: string) {
  if (a.endsWith("/") && b.startsWith("/")) {
    return a + b.slice(1);
  } else {
    return a + b;
  }
}
