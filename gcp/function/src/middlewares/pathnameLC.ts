import * as url from "node:url";

import type express from "express";

export function pathnameLC(
  req: express.Request,
  _res: express.Response,
  next: express.NextFunction
) {
  console.log("before", req.url);
  const urlParsed = url.parse(req.url);
  if (urlParsed.pathname) {
    urlParsed.pathname = urlParsed.pathname.toLowerCase();
  }
  req.url = url.format(urlParsed);
  next();
}
