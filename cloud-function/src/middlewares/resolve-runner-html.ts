import * as url from "node:url";

import { NextFunction, Request, Response } from "express";

declare module "express-serve-static-core" {
  interface Response {
    unsafeRunner?: boolean;
  }
}

export async function resolveRunnerHtml(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const urlParsed = url.parse(req.url);
  console.log(urlParsed.href);
  if (urlParsed.pathname && urlParsed.pathname.endsWith("/runner.html")) {
    urlParsed.pathname = "/runner.html";
    req.url = url.format(urlParsed);
    // Workaround for http-proxy-middleware v2 using `req.originalUrl`.
    // See: https://github.com/chimurai/http-proxy-middleware/pull/731
    req.originalUrl = req.url;
    res.unsafeRunner = false;
  } else if (
    urlParsed.pathname &&
    urlParsed.pathname.endsWith("/unsafe-runner.html")
  ) {
    urlParsed.pathname = "/runner.html";
    req.url = url.format(urlParsed);
    // Workaround for http-proxy-middleware v2 using `req.originalUrl`.
    // See: https://github.com/chimurai/http-proxy-middleware/pull/731
    req.originalUrl = req.url;
    res.unsafeRunner = true;
  }
  next();
}
