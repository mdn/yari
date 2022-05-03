export const VALID_LOCALES = new Map(
  [
    "de",
    "en-US",
    "es",
    "fr",
    "ja",
    "ko",
    "pl",
    "pt-BR",
    "ru",
    "zh-CN",
    "zh-TW",
  ].map((x) => [x.toLowerCase(), x])
);

export const RETIRED_LOCALES = new Map(
  [
    "ar",
    "bg",
    "bn",
    "ca",
    "el",
    "fa",
    "fi",
    "he",
    "hi-IN",
    "hu",
    "id",
    "it",
    "kab",
    "ms",
    "my",
    "nl",
    "pt-PT",
    "sv-SE",
    "th",
    "tr",
    "uk",
    "vi",
  ].map((x) => [x.toLowerCase(), x])
);

export const DEFAULT_LOCALE = "en-US";

export const LOCALE_ALIASES = new Map([
  // Case is not important on either the keys or the values.
  ["en", "en-us"],
  ["pt", "pt-br"],
  ["cn", "zh-cn"],
  ["zh", "zh-cn"],
  ["zh-hans", "zh-cn"],
  ["zh-hant", "zh-tw"],
]);

// This must match what we do in `language-menu/index.tsx` where the cookie
// gets set in the client!
export const PREFERRED_LOCALE_COOKIE_NAME = "preferredlocale";
export const ACTIVE_LOCALES = new Set([
  "en-us",
  "es",
  "fr",
  "ja",
  "ko",
  "pt-br",
  "ru",
  "zh-cn",
  "zh-tw",
]);

export const scriptSrcValues = [
  "'report-sample'",
  "'self'",

  "www.google-analytics.com/analytics.js",

  "'sha256-JEt9Nmc3BP88wxuTZm9aKNu87vEgGmKW1zzy/vb1KPs='", // polyfill check
  "polyfill.io/v3/polyfill.min.js",

  "assets.codepen.io",
  "production-assets.codepen.io",

  /**
   * If we modify the inline script in `client/public/index.html`,
   * we must always update the CSP hash (see instructions there).
   */
  // - Previous hash (to avoid cache invalidation issues):
  "'sha256-x6Tv+AdV5e6dcolO0TEo+3BG4H2nG2ACjyG8mz6QCes='",
  // - Current hash:
  "'sha256-GA8+DpFnqAM/vwERTpb5zyLUaN5KnOhctfTsqWfhaUA='",
];
export const CSP_DIRECTIVES = {
  "default-src": ["'self'"],
  "script-src": scriptSrcValues,
  "script-src-elem": scriptSrcValues,
  "style-src": ["'report-sample'", "'self'", "'unsafe-inline'"],
  "object-src": ["'none'"],
  "base-uri": ["'self'"],
  "connect-src": [
    "'self'",

    "updates.developer.allizom.org",
    "updates.developer.mozilla.org",

    "www.google-analytics.com",
    "stats.g.doubleclick.net",
  ],
  "font-src": ["'self'"],
  "frame-src": [
    "'self'",

    "interactive-examples.mdn.mozilla.net",
    "interactive-examples.prod.mdn.mozilla.net",
    "interactive-examples.stage.mdn.mozilla.net",
    "mdn.github.io",
    "yari-demos.prod.mdn.mozit.cloud",
    "mdn.mozillademos.org",
    "yari-demos.stage.mdn.mozit.cloud",

    "jsfiddle.net",
    "www.youtube-nocookie.com",
    "codepen.io",
  ],
  "img-src": [
    "'self'",

    // Avatars
    "*.githubusercontent.com",
    "*.googleusercontent.com",
    "*.gravatar.com",
    "mozillausercontent.com",
    "firefoxusercontent.com",
    "profile.stage.mozaws.net",
    "profile.accounts.firefox.com",

    "mdn.mozillademos.org",
    "media.prod.mdn.mozit.cloud",
    "media.stage.mdn.mozit.cloud",
    "interactive-examples.mdn.mozilla.net",
    "interactive-examples.prod.mdn.mozilla.net",
    "interactive-examples.stage.mdn.mozilla.net",

    "wikipedia.org",

    "www.google-analytics.com",
    "www.gstatic.com",
  ],
  "manifest-src": ["'self'"],
  "media-src": ["'self'", "archive.org", "videos.cdn.mozilla.net"],
  "child-src": ["'self'"],
  "worker-src": ["'self'"],
};

export const cspToString = (csp) =>
  Object.entries(csp)
    .map(([directive, values]) => `${directive} ${values.join(" ")};`)
    .join(" ");

export const CSP_VALUE = cspToString(CSP_DIRECTIVES);
