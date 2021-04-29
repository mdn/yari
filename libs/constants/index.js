const VALID_LOCALES = new Map(
  [
    "ar",
    "bg",
    "bn",
    "ca",
    "de",
    "el",
    "en-US",
    "es",
    "fa",
    "fi",
    "fr",
    "he",
    "hi-IN",
    "hu",
    "id",
    "it",
    "ja",
    "kab",
    "ko",
    "ms",
    "my",
    "nl",
    "pl",
    "pt-BR",
    "pt-PT",
    "ru",
    "sv-SE",
    "th",
    "tr",
    "uk",
    "vi",
    "zh-CN",
    "zh-TW",
  ].map((x) => [x.toLowerCase(), x])
);

const DEFAULT_LOCALE = "en-US";

const LOCALE_ALIASES = new Map([
  // Case is not important on either the keys or the values.
  ["en", "en-us"],
  ["pt", "pt-PT"], // Note! Portugal Portugese is the default
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

const CSP_DIRECTIVES = [
  "default-src 'self'",
  "script-src " +
    [
      "'report-sample'",
      "'self'",
      "https://cdn.speedcurve.com/js/lux.js",
      "'sha256-q7cJjDqNO2e1L5UltvJ1LhvnYN7yJXgGO7b6h9xkL1o='", // LUX
      "https://www.google-analytics.com/analytics.js",
      "https://www.google-analytics.com/analytics_debug.js",
      "'sha256-JEt9Nmc3BP88wxuTZm9aKNu87vEgGmKW1zzy/vb1KPs='", // polyfill check
      "https://polyfill.io/v3/polyfill.min.js",
    ].join(" "),
  // TODO: eventually drop unsafe-inline, after our move to Markdown
  "style-src 'report-sample' 'self' 'unsafe-inline'",
  "object-src 'none'",
  "base-uri 'self'",
  "connect-src 'self'",
  "font-src 'self'",
  "frame-src 'self' https://interactive-examples.mdn.mozilla.net https://mdn.github.io https://yari-demos.prod.mdn.mozit.cloud",
  "img-src 'self' https://avatars1.githubusercontent.com",
  "manifest-src 'self'",
  "media-src 'self'",
  "worker-src 'none'",
  "report-uri https://developer.mozilla.org/csp-violation-capture",
]
  .map((s) => s + ";")
  .join(" ");

module.exports = {
  ACTIVE_LOCALES,
  VALID_LOCALES,
  DEFAULT_LOCALE,
  LOCALE_ALIASES,
  PREFERRED_LOCALE_COOKIE_NAME,
  CSP_DIRECTIVES,
};
