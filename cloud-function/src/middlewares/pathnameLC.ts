import * as url from "node:url";

import type express from "express";

export async function pathnameLC(
  req: express.Request,
  _res: express.Response,
  next: express.NextFunction
) {
  const urlParsed = url.parse(req.url);
  if (urlParsed.pathname) {
    urlParsed.pathname = urlParsed.pathname.toLowerCase();
  }
  req.url = url.format(urlParsed);
  // Workaround for http-proxy-middleware v2 using `req.originalUrl`.
  // See: https://github.com/chimurai/http-proxy-middleware/pull/731
  req.originalUrl = req.url;
  next();
}
