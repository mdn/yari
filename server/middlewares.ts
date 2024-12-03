import express from "express";

import { CSP_VALUE } from "../libs/constants/index.js";
import { PLAYGROUND_UNSAFE_CSP_VALUE } from "../libs/play/index.js";
import { STATIC_ROOT } from "../libs/env/index.js";
import { resolveFundamental } from "../libs/fundamental-redirects/index.js";
import { getLocale } from "../libs/locale-utils/index.js";

const slugLowercase = (req, res, next) => {
  req.url = req.url.toLowerCase();
  next();
};

const staticServer = express.static(STATIC_ROOT, {
  setHeaders: (res) => {
    if (res.req.path.endsWith("/runner.html")) {
      res.setHeader("Content-Security-Policy", PLAYGROUND_UNSAFE_CSP_VALUE);
    } else {
      res.setHeader("Content-Security-Policy", CSP_VALUE);
    }
  },
});

// This is necessary for case-sensitive filesystems, such as on Linux 🐧
export const staticMiddlewares = [staticServer, slugLowercase, staticServer];

/**
 * This function is returns an object with {url:string, status:number}
 * if there's some place to redirect to, otherwise an empty object.
 */
export const originRequestMiddleware = (req, res, next) => {
  const { url: fundamentalRedirectUrl, status } = resolveFundamental(req.url);
  if (fundamentalRedirectUrl && status) {
    res.redirect(status, fundamentalRedirectUrl);
  } else if (req.url === "/" || req.url.startsWith("/docs/")) {
    // Fake it so it becomes like Lambda@Edge
    req.headers.cookie = [
      {
        // The `req.cookies` comes from cookie-parser
        value: Object.entries(req.cookies)
          .map(([key, value]) => `${key}=${value}`)
          .join(";"),
      },
    ];
    if (req.headers["accept-language"]) {
      // Lambda@Edge expects it to be an array of objects
      req.headers["accept-language"] = [
        { value: req.headers["accept-language"] },
      ];
    }
    const path = req.url.endsWith("/") ? req.url.slice(0, -1) : req.url;
    const locale = getLocale(req);
    // The only time we actually want a trailing slash is when the URL is just
    // the locale. E.g. `/en-US/` (not `/en-US`)
    res.redirect(302, `/${locale}${path || "/"}`);
  } else {
    next();
  }
};
