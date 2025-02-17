import { NextFunction, Request, Response } from "express";

import { THIRTY_DAYS } from "../constants.js";
import { resolveFundamental } from "../internal/fundamental-redirects/index.js";
import { redirect } from "../utils.js";

export async function redirectFundamental(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const url = new URL(req.url, `${req.protocol}://${req.headers.host}`);
  const requestURI = req.path;

  const fundamentalRedirect = resolveFundamental(requestURI);
  if (fundamentalRedirect.url) {
    // NOTE: The query string is not forwarded for document requests,
    //       as directed by their origin request policy, so it's safe to
    //       assume "request.querystring" is empty for document requests.
    if (url.search) {
      fundamentalRedirect.url +=
        (fundamentalRedirect.url.includes("?") ? "&" : "?") +
        url.search.substring(1);
    }
    return redirect(res, fundamentalRedirect.url, {
      status: fundamentalRedirect.status,
      cacheControlSeconds: THIRTY_DAYS,
    });
  }

  next();
}
