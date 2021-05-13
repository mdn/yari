const VALID_LOCALES = new Map(
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

const RETIRED_LOCALES = new Map(
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

const DEFAULT_LOCALE = "en-US";

const LOCALE_ALIASES = new Map([
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
const PREFERRED_LOCALE_COOKIE_NAME = "preferredlocale";
const ACTIVE_LOCALES = new Set([
  "en-us",
  "fr",
  "ja",
  "ko",
  "ru",
  "zh-cn",
  "zh-tw",
]);

const scriptSrcValues = [
  "'report-sample'",
  "'self'",
  "*.speedcurve.com",
  "'sha256-q7cJjDqNO2e1L5UltvJ1LhvnYN7yJXgGO7b6h9xkL1o='", // LUX
  "www.google-analytics.com/analytics.js",
  "'sha256-JEt9Nmc3BP88wxuTZm9aKNu87vEgGmKW1zzy/vb1KPs='", // polyfill check
  "polyfill.io/v3/polyfill.min.js",
];
const CSP_DIRECTIVES = {
  "default-src": ["'self'"],
  "script-src": scriptSrcValues,
  "script-src-elem": scriptSrcValues,
  "style-src": ["'report-sample'", "'self'", "'unsafe-inline'"],
  "object-src": ["'none'"],
  "base-uri": ["'self'"],
  "connect-src": ["'self'"],
  "font-src": ["'self'"],
  "frame-src": [
    "'self'",
    "interactive-examples.mdn.mozilla.net",
    "mdn.github.io",
    "yari-demos.prod.mdn.mozit.cloud",
    "mdn.mozillademos.org",
    "yari-demos.stage.mdn.mozit.cloud",
    "jsfiddle.net",
    "www.youtube-nocookie.com",
  ],
  "img-src": [
    "'self'",
    "*.githubusercontent.com",
    "*.googleusercontent.com",
    "lux.speedcurve.com",
    "mdn.mozillademos.org",
    "media.prod.mdn.mozit.cloud",
    "media.stage.mdn.mozit.cloud",
    "interactive-examples.mdn.mozilla.net",
    "wikipedia.org",
  ],
  "manifest-src": ["'self'"],
  "media-src": ["'self'", "archive.org", "videos.cdn.mozilla.net"],
  "worker-src": ["'none'"],
  "report-uri": ["/csp-violation-capture"],
};

const cspToString = (csp) =>
  Object.entries(csp)
    .map(([directive, values]) => `${directive} ${values.join(" ")};`)
    .join(" ");

const CSP_VALUE_STAGE = cspToString({
  ...CSP_DIRECTIVES,
  "report-uri": [
    "https://sentry.prod.mozaws.net/api/72/security/?sentry_key=25e652a045b642dfaa310e92e800058a",
  ],
});
const CSP_VALUE_PROD = cspToString({
  ...CSP_DIRECTIVES,
  "report-uri": [
    "https://sentry.prod.mozaws.net/api/73/security/?sentry_key=8664389dc16c4e9786e4a396f2964952",
  ],
});
const CSP_VALUE_DEV = cspToString(CSP_DIRECTIVES);

module.exports = {
  ACTIVE_LOCALES,
  VALID_LOCALES,
  RETIRED_LOCALES,
  DEFAULT_LOCALE,
  LOCALE_ALIASES,
  PREFERRED_LOCALE_COOKIE_NAME,

  CSP_VALUE_PROD,
  CSP_VALUE_STAGE,
  CSP_VALUE_DEV,
};
