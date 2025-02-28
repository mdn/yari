import * as path from "node:path";

import { NextFunction, Request, Response } from "express";

import { slugToFolder } from "../internal/slug-utils/index.js";
import { isAsset } from "../utils.js";
import { ORIGIN_REVIEW_MATCHER } from "../env.js";

export async function resolveIndexHTML(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const urlParsed = new URL(req.url, `${req.protocol}://${req.headers.host}`);

  const reviewPrefix = ORIGIN_REVIEW_MATCHER(urlParsed.hostname);
  console.log(
    `[resolveIndexHTML] urlParsed.hostname = ${JSON.stringify(urlParsed.hostname)}`
  );
  console.log(
    `[resolveIndexHTML] reviewPrefix = ${JSON.stringify(reviewPrefix)}`
  );
  console.log(reviewPrefix);
  if (reviewPrefix) {
    let pathname = slugToFolder(urlParsed.pathname);
    if (pathname.endsWith("/")) {
      pathname = pathname.slice(0, -1);
    }
    req.url = "/" + reviewPrefix + pathname; // e.g. "/en-us/docs/mozilla/add-ons/webextensions/browser_compatibility_for_manifest.json"
    console.log(`[resolveIndexHTML] req.url = ${JSON.stringify(req.url)}`);
    // Workaround for http-proxy-middleware v2 using `req.originalUrl`.
    // See: https://github.com/chimurai/http-proxy-middleware/pull/731
    req.originalUrl = req.url;
  } else if (urlParsed.pathname) {
    let pathname = slugToFolder(urlParsed.pathname);
    if (!isAsset(pathname)) {
      pathname = path.join(pathname, "index.html");
    }
    req.url = pathname; // e.g. "/en-us/docs/mozilla/add-ons/webextensions/browser_compatibility_for_manifest.json"
    // Workaround for http-proxy-middleware v2 using `req.originalUrl`.
    // See: https://github.com/chimurai/http-proxy-middleware/pull/731
    req.originalUrl = req.url;
  }
  next();
}
