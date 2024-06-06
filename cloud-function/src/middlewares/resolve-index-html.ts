import * as path from "node:path";

import { NextFunction, Request, Response } from "express";

import { slugToFolder } from "../internal/slug-utils/index.js";
import { isAsset } from "../utils.js";

export async function resolveIndexHTML(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const urlParsed = new URL(req.url, `${req.protocol}://${req.headers.host}`);
  if (urlParsed.pathname) {
    let pathname = slugToFolder(urlParsed.pathname);
    if (!isAsset(pathname)) {
      pathname = path.join(pathname, "index.html");
    }
    urlParsed.pathname = pathname;
    req.url = urlParsed.toString();
    // Workaround for http-proxy-middleware v2 using `req.originalUrl`.
    // See: https://github.com/chimurai/http-proxy-middleware/pull/731
    req.originalUrl = req.url;
  }
  next();
}
