import { createRequire } from "node:module";

import type express from "express";

import { resolveFundamental } from "@yari-internal/fundamental-redirects";
import { getLocale } from "@yari-internal/locale-utils";
import { decodePath } from "@yari-internal/slug-utils";
import { VALID_LOCALES } from "@yari-internal/constants";

const require = createRequire(import.meta.url);
const REDIRECTS = require("../../redirects.json");
const REDIRECT_SUFFIXES = ["/index.json", "/bcd.json", ""];
const THIRTY_DAYS = 3600 * 24 * 30;
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

export function redirects(
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

  // If the URL was something like `https://domain/en-US/search/`, our code
  // would make a that a redirect to `/en-US/search` (stripping the trailing slash).
  // But if it was `https://domain//en-US/search/` it *would* make a redirect
  // to `//en-US/search`.
  // However, if pathname starts with `//` the Location header might look
  // relative but it's actually an absolute URL.
  // A 302 redirect from `https://domain//evil.com/` actually ends open
  // opening `https://evil.com/` in the browser, because the browser will
  // treat `//evil.com/ == https://evil.com/`.
  // Prevent any pathnames that start with a double //.
  // This essentially means that a request for `GET /////anything` becomes
  // 302 with `Location: /anything`.
  if (requestURI.startsWith("//")) {
    return redirect(`/${requestURI.replace(/^\/+/g, "")}`);
  }

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
    return redirect(fundamentalRedirect.url, {
      status: fundamentalRedirect.status,
      cacheControlSeconds: THIRTY_DAYS,
    });
  }

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

  // Important: The requestURI may be URI-encoded.
  // Example:
  // - Encoded: /zh-TW/docs/AJAX:%E4%B8%8A%E6%89%8B%E7%AF%87
  // - Decoded: /zh-TW/docs/AJAX:上手篇
  const decodedUri = decodePath(url.pathname);
  const decodedUriLC = decodedUri.toLowerCase();

  // Redirect moved pages (see `_redirects.txt` in content/translated-content).
  // Example:
  // - Source: /zh-TW/docs/AJAX:上手篇
  // - Target: /zh-TW/docs/Web/Guide/AJAX/Getting_Started
  for (const suffix of REDIRECT_SUFFIXES) {
    if (!decodedUriLC.endsWith(suffix)) {
      continue;
    }
    const source = decodedUriLC.substring(
      0,
      decodedUriLC.length - suffix.length
    );
    if (typeof REDIRECTS[source] == "string") {
      const target = REDIRECTS[source] + suffix;
      return redirect(target, {
        status: 301,
        cacheControlSeconds: THIRTY_DAYS,
      });
    }
  }

  next();
}
