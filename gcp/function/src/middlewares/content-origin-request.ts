import type express from "express";

import { getLocale } from "@yari-internal/locale-utils";
import { VALID_LOCALES } from "@yari-internal/constants";
import { THIRTY_DAYS } from "../constants.js";

const NEEDS_LOCALE = /^\/(?:docs|search|settings|signin|signup|plus)(?:$|\/)/;
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

export function contentOriginRequest(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  function redirect(
    location: string,
    { status = 302, cacheControlSeconds = 0 } = {}
  ) {
    let cacheControlValue;
    if (cacheControlSeconds) {
      cacheControlValue = `max-age=${cacheControlSeconds},public`;
    } else {
      cacheControlValue = "no-store";
    }

    res.set("Cache-Control", cacheControlValue);

    // We need to URL encode the pathname, but leave the query string as is.
    // Suppose the old URL was `/search?q=text%2Dshadow` and all we need to do
    // is to inject the locale to that URL, we should not URL encode the whole
    // new URL otherwise you'd end up with `/en-US/search?q=text%252Dshadow`
    // since the already encoded `%2D` would become `%252D` which is wrong and
    // different.
    const [pathname, querystring] = location.split("?", 2);
    let newLocation = encodeURI(pathname || "");
    if (querystring) {
      newLocation += `?${querystring}`;
    }

    res.redirect(status, newLocation);
    next();
  }

  const url = new URL(req.url, `${req.protocol}://${req.headers.host}`);
  let requestURI = url.pathname;
  const requestURILowerCase = requestURI.toLowerCase();
  const qs = url.search;

  // Do we need to insert the locale? If we do, trim a trailing slash
  // to avoid a double redirect, except when requesting the home page.
  if (
    requestURI === "" ||
    requestURI === "/" ||
    NEEDS_LOCALE.test(requestURILowerCase)
  ) {
    const path = requestURI.endsWith("/")
      ? requestURI.slice(0, -1)
      : requestURI;
    // Note that "getLocale" only returns valid locales, never a retired locale.
    const locale = getLocale(req);
    // The only time we actually want a trailing slash is when the URL is just
    // the locale. E.g. `/en-US/` (not `/en-US`)
    return redirect(`/${locale}${path || "/"}` + qs);
  }

  // At this point, the URI is guaranteed to start with a forward slash.
  const uriParts = requestURI.split("/");
  const uriFirstPart = uriParts[1] ?? "";
  const uriFirstPartLC = uriFirstPart.toLowerCase();

  // Do we need to redirect to the properly-cased locale? We also ensure
  // here that requests for the home page have a trailing slash, while
  // all others do not.
  if (
    VALID_LOCALES.has(uriFirstPartLC) &&
    uriFirstPart !== VALID_LOCALES.get(uriFirstPartLC)
  ) {
    // Assemble the rest of the path without a trailing slash.
    const extra = uriParts.slice(2).filter(Boolean).join("/");
    return redirect(`/${VALID_LOCALES.get(uriFirstPartLC)}/${extra}${qs}`);
  }

  // Handle cases related to the presence or absence of a trailing-slash.
  if (LOCALE_URI_WITHOUT_TRAILING_SLASH.has(requestURILowerCase)) {
    // Home page requests are the special case on MDN. They should
    // always have a trailing slash. So a home page URL without a
    // trailing slash should redirect to the same URL with a
    // trailing slash. When the redirected home-page request is
    // processed by this Lambda function, note that we'll remove
    // the trailing slash before the request reaches S3 (see below).
    return redirect(requestURI + "/" + qs, {
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
    return redirect(requestURI.slice(0, -1) + qs, {
      cacheControlSeconds: THIRTY_DAYS,
    });
  }

  next();
}
