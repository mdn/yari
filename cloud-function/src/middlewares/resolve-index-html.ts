import * as path from "node:path";

import { NextFunction, Request, Response } from "express";

import { slugToFolder } from "../internal/slug-utils/index.js";

export async function resolveIndexHTML(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  let resolvedUrl = slugToFolder(req.url);
  if (path.extname(resolvedUrl) === "") {
    resolvedUrl = path.join(resolvedUrl, "index.html");
  }
  req.url = resolvedUrl;
  // Workaround for http-proxy-middleware v2 using `req.originalUrl`.
  // See: https://github.com/chimurai/http-proxy-middleware/pull/731
  req.originalUrl = req.url;
  next();
}
