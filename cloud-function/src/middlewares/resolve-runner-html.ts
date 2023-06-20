import * as url from "node:url";

import { NextFunction, Request, Response } from "express";

export async function resolveRunnerHtml(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const urlParsed = url.parse(req.url);
  if (urlParsed.pathname && urlParsed.pathname.endsWith("/runner.html")) {
    urlParsed.pathname = "/runner.html";
    req.url = url.format(urlParsed);
    // Workaround for http-proxy-middleware v2 using `req.originalUrl`.
    // See: https://github.com/chimurai/http-proxy-middleware/pull/731
    req.originalUrl = req.url;
  }
  next();
}
