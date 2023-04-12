import type express from "express";

import { THIRTY_DAYS } from "../constants.js";
import { VALID_LOCALES } from "../internal/constants/index.js";
import { redirect } from "../utils.js";

// Note that the keys of "VALID_LOCALES" are lowercase locales.
const LOCALE_URI_WITHOUT_TRAILING_SLASH = new Set(
  [...VALID_LOCALES.keys()].map((locale) => `/${locale}`)
);
const LOCALE_URI_WITH_TRAILING_SLASH = new Set(
  [...VALID_LOCALES.keys()].map((locale) => `/${locale}/`)
);
// TODO: The code that uses LEGACY_URI_NEEDING_TRAILING_SLASH should be
//       temporary. For example, when we have moved to the Yari-built
//       account settings page, we should add fundamental redirects
//       for "/{locale}/account/?" and "/account/?" that redirect to
//       "/{locale}/settings" and "/settings" respectively. The other
//       cases can be either redirected or deleted eventually as well.
//       The goal is to eventually remove the code that uses
//       LEGACY_URI_NEEDING_TRAILING_SLASH.
const LEGACY_URI_NEEDING_TRAILING_SLASH = new RegExp(
  `^(?:${[...LOCALE_URI_WITHOUT_TRAILING_SLASH].join(
    "|"
  )})?/(?:account|contribute|maintenance-mode|payments)/?$`
);

export async function redirectTrailingSlash(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const url = new URL(req.url, `${req.protocol}://${req.headers.host}`);
  let requestURI = url.pathname;
  const requestURILowerCase = requestURI.toLowerCase();
  const qs = url.search;

  // Handle cases related to the presence or absence of a trailing-slash.
  if (LOCALE_URI_WITHOUT_TRAILING_SLASH.has(requestURILowerCase)) {
    // Home page requests are the special case on MDN. They should
    // always have a trailing slash. So a home page URL without a
    // trailing slash should redirect to the same URL with a
    // trailing slash. When the redirected home-page request is
    // processed by this Lambda function, note that we'll remove
    // the trailing slash before the request reaches S3 (see below).
    return redirect(res, requestURI + "/" + qs, {
      cacheControlSeconds: THIRTY_DAYS,
    });
  } else if (LOCALE_URI_WITH_TRAILING_SLASH.has(requestURILowerCase)) {
    // We've received a proper request for a locale's home page (i.e.,
    // it has a traling slash), but since that request will be served
    // from S3, we need to strip the trailing slash before it reaches
    // S3. This is required because we store the home pages in S3 as
    // their path name itself, for example "en-us" for the English home
    // page, not "en-us/index.html", which is what S3 would look for if
    // we left the trailing slash.
    requestURI = requestURI.slice(0, -1);
  } else if (
    requestURI.endsWith("/") &&
    !LEGACY_URI_NEEDING_TRAILING_SLASH.test(requestURILowerCase)
  ) {
    // All other requests with a trailing slash should redirect to the
    // same URL without the trailing slash.
    return redirect(res, requestURI.slice(0, -1) + qs, {
      cacheControlSeconds: THIRTY_DAYS,
    });
  }

  next();
}
