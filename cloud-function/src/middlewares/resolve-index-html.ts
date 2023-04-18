import * as path from "node:path";
import * as url from "node:url";

import { NextFunction, Request, Response } from "express";

import { slugToFolder } from "../internal/slug-utils/index.js";

// These are the only extensions in client/build/*/docs/*.
// `find client/build -type f | grep docs | xargs basename | sed 's/.*\.\([^.]*\)$/\1/' | sort | uniq`
const ASSET_REGEXP = /\.(gif|html|jpeg|jpg|json|png|svg|txt)$/i;

function isAsset(url: string) {
  return ASSET_REGEXP.test(url);
}

export async function resolveIndexHTML(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const urlParsed = url.parse(req.url);
  if (urlParsed.pathname) {
    let pathname = slugToFolder(urlParsed.pathname);
    if (!isAsset(pathname)) {
      pathname = path.join(pathname, "index.html");
    }
    urlParsed.pathname = pathname;
    req.url = url.format(urlParsed);
    // Workaround for http-proxy-middleware v2 using `req.originalUrl`.
    // See: https://github.com/chimurai/http-proxy-middleware/pull/731
    req.originalUrl = req.url;
  }
  next();
}
