const express = require("express");

const { CSP_VALUE_DEV } = require("../libs/constants");
const { resolveFundamental } = require("../libs/fundamental-redirects");
const { getLocale } = require("../libs/get-locale");
const { STATIC_ROOT } = require("./constants");

// Lowercase every request because every possible file we might have
// on disk is always in lowercase.
// This only helps when you're on a filesystem (e.g. Linux) that is case
// sensitive.
const slugRewrite = (req, res, next) => {
  req.url = req.url.toLowerCase();
  next();
};

/**
 * This function is returns an object with {url:string, status:number}
 * if there's some place to redirect to, otherwise an empty object.
 */
const originRequest = (req, res, next) => {
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

module.exports = {
  staticMiddlewares: [
    slugRewrite,
    express.static(STATIC_ROOT, {
      setHeaders: (res) => {
        res.setHeader("Content-Security-Policy", CSP_VALUE_DEV);
      },
    }),
  ],
  originRequestMiddleware: originRequest,
};
