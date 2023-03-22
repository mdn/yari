import type express from "express";

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

  next();
}
