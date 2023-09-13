import * as url from "node:url";

import { NextFunction, Request, Response } from "express";

export async function lowercasePathname(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const urlParsed = new URL(req.url);
  if (urlParsed.pathname) {
    urlParsed.pathname = urlParsed.pathname.toLowerCase();
    req.url = url.format(urlParsed);
    // Workaround for http-proxy-middleware v2 using `req.originalUrl`.
    // See: https://github.com/chimurai/http-proxy-middleware/pull/731
    req.originalUrl = req.url;
  }
  next();
}
