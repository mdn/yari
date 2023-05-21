import { NextFunction, Request, Response } from "express";

import { THIRTY_DAYS } from "../constants.js";
import { isAsset, redirect } from "../utils.js";

export async function redirectEnforceTrailingSlash(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const url = new URL(req.url, `${req.protocol}://${req.headers.host}`);
  const requestURI = url.pathname;
  const qs = url.search;

  if (!requestURI.endsWith("/") && !isAsset(requestURI)) {
    // All other requests with a trailing slash should redirect to the
    // same URL without the trailing slash.
    return redirect(res, requestURI + "/" + qs, {
      cacheControlSeconds: THIRTY_DAYS,
    });
  }

  next();
}
