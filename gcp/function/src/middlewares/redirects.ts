import { createRequire } from "node:module";

import type express from "express";

import { resolveFundamental } from "@yari-internal/fundamental-redirects";
import { decodePath } from "@yari-internal/slug-utils";

const require = createRequire(import.meta.url);
const REDIRECTS = require("../../redirects.json");
const REDIRECT_SUFFIXES = ["/index.json", "/bcd.json", ""];
const THIRTY_DAYS = 3600 * 24 * 30;

export function redirects(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
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
  if (req.url.startsWith("//")) {
    res.redirect(`/${req.url.replace(/^\/+/g, "")}`);
    next();
    return;
  }

  const { url, status } = resolveFundamental(req.url);
  if (url) {
    res.set("Cache-Control", `max-age=${THIRTY_DAYS}`);
    if (status) {
      res.redirect(status, url);
    } else {
      res.redirect(url);
    }
    next();
    return;
  }

  // Important: The request.uri may be URI-encoded.
  // Example:
  // - Encoded: /zh-TW/docs/AJAX:%E4%B8%8A%E6%89%8B%E7%AF%87
  // - Decoded: /zh-TW/docs/AJAX:上手篇
  const decodedUri = decodePath(req.url);
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
      console.log(req.url, target);
      res.set("Cache-Control", `max-age=${THIRTY_DAYS}`);
      res.redirect(301, target);
      next();
      return;
    }
  }

  next();
}
