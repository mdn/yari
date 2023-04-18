import { Request, Response } from "express";

import { DEFAULT_COUNTRY } from "./constants.js";

export function getRequestCountry(req: Request): string {
  const value = req.headers["cloudfront-viewer-country"];

  if (typeof value === "string" && value !== "ZZ") {
    return value;
  } else {
    return DEFAULT_COUNTRY;
  }
}

export function redirect(
  res: Response,
  location: string,
  { status = 302, cacheControlSeconds = 0 } = {}
): void {
  let cacheControlValue;
  if (cacheControlSeconds) {
    cacheControlValue = `max-age=${cacheControlSeconds},public`;
  } else {
    cacheControlValue = "no-store";
  }

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

  res.set("Cache-Control", cacheControlValue).redirect(status, newLocation);
}

export function isLiveSampleURL(url: string) {
  return url.includes("/_sample_.");
}
