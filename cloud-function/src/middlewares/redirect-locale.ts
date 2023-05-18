import { NextFunction, Request, Response } from "express";

import { getLocale } from "../internal/locale-utils/index.js";
import { VALID_LOCALES } from "../internal/constants/index.js";
import { redirect } from "../utils.js";

const NEEDS_LOCALE = /^\/(?:docs|search|settings|signin|signup|plus)(?:$|\/)/;

export async function redirectLocale(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const url = new URL(req.url, `${req.protocol}://${req.headers.host}`);
  const requestURI = url.pathname;
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
    return redirect(res, `/${locale}${path || "/"}` + qs);
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
    return redirect(res, `/${VALID_LOCALES.get(uriFirstPartLC)}/${extra}${qs}`);
  }

  next();
}
