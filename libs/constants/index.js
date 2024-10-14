export const VALID_LOCALES = new Map(
  ["en-US", "es", "fr", "ja", "ko", "pt-BR", "ru", "zh-CN", "zh-TW"].map(
    (x) => [x.toLowerCase(), x]
  )
);

export const RETIRED_LOCALES = new Map(
  [
    "ar",
    "bg",
    "bn",
    "ca",
    "de",
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
    "pl",
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

export const CSP_SCRIPT_SRC_VALUES = [
  "'report-sample'",
  "'self'",

  // GA4.
  "https://www.google-analytics.com/analytics.js",
  "https://www.googletagmanager.com/gtag/js",

  "assets.codepen.io",
  "production-assets.codepen.io",

  "https://js.stripe.com",

  /*
   * Inline scripts (imported in `ssr/render.tsx`).
   *
   * If we modify them, we must always update their CSP hash here.
   *
   * Important: Please make sure to always keep an entry for the
   * previous hash to avoid issues shortly after cache invalidation.
   */

  // 1. Theme switching.
  // - Previous hash (to avoid cache invalidation issues):
  "'sha256-EehWlTYp7Bqy57gDeQttaWKp0ukTTEUKGP44h8GVeik='",
  // - Current hash:
  "'sha256-XNBp89FG76amD8BqrJzyflxOF9PaWPqPqvJfKZPCv7M='",
];
export const CSP_DIRECTIVES = {
  "default-src": ["'self'"],
  "script-src": CSP_SCRIPT_SRC_VALUES,
  "script-src-elem": CSP_SCRIPT_SRC_VALUES,
  "style-src": ["'report-sample'", "'self'", "'unsafe-inline'"],
  "object-src": ["'none'"],
  "base-uri": ["'self'"],
  "connect-src": [
    "'self'",

    "developer.allizom.org", // required for glean to work on localhost:5042

    "bcd.developer.allizom.org",
    "bcd.developer.mozilla.org",

    "updates.developer.allizom.org",
    "updates.developer.mozilla.org",

    // GA4.
    "https://*.google-analytics.com",
    "https://*.analytics.google.com",
    "https://*.googletagmanager.com",

    // Observatory
    "https://observatory-api.mdn.allizom.net",
    "https://observatory-api.mdn.mozilla.net",

    "stats.g.doubleclick.net",
    "https://api.stripe.com",
  ],
  "font-src": ["'self'"],
  "frame-src": [
    "'self'",

    "interactive-examples.mdn.mozilla.net",
    "interactive-examples.mdn.allizom.net",
    "mdn.github.io",
    "live-samples.mdn.mozilla.net",
    "live-samples.mdn.allizom.net",
    "*.mdnplay.dev",
    "*.mdnyalp.dev",

    "https://v2.scrimba.com",
    "https://scrimba.com",
    "jsfiddle.net",
    "www.youtube-nocookie.com",
    "codepen.io",
    "survey.alchemer.com",
    "https://js.stripe.com",
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

    "mdn.dev",
    "interactive-examples.mdn.mozilla.net",
    "interactive-examples.mdn.allizom.net",

    "wikipedia.org",
    "upload.wikimedia.org",

    // Shared assets.
    "https://mdn.github.io/shared-assets/",

    // GA4.
    "https://*.google-analytics.com",
    "https://*.googletagmanager.com",

    "www.gstatic.com",
  ],
  "manifest-src": ["'self'"],
  "media-src": [
    "'self'",
    "archive.org",
    "videos.cdn.mozilla.net",

    // Shared assets.
    "https://mdn.github.io/shared-assets/",
  ],
  "child-src": ["'self'"],
  "worker-src": ["'self'"],
};

export const cspToString = (csp) =>
  Object.entries(csp)
    .map(([directive, values]) => `${directive} ${values.join(" ")};`)
    .join(" ");

export const CSP_VALUE = cspToString(CSP_DIRECTIVES);

const PLAYGROUND_UNSAFE_CSP_SCRIPT_SRC_VALUES = [
  "'self'",
  "https:",
  "'unsafe-eval'",
  "'unsafe-inline'",
  "'wasm-unsafe-eval'",
];

export const PLAYGROUND_UNSAFE_CSP_VALUE = cspToString({
  "default-src": ["'self'", "https:"],
  "script-src": PLAYGROUND_UNSAFE_CSP_SCRIPT_SRC_VALUES,
  "script-src-elem": PLAYGROUND_UNSAFE_CSP_SCRIPT_SRC_VALUES,
  "style-src": [
    "'report-sample'",
    "'self'",
    "https:",
    "'unsafe-inline'",
    "'unsafe-eval'",
  ],
  "img-src": ["'self'", "blob:", "https:", "data:"],
  "base-uri": ["'self'"],
  "worker-src": ["'self'"],
  "manifest-src": ["'self'"],
});

// Always update client/src/setupProxy.js when adding/removing extensions, or it won't work on the dev server!
export const AUDIO_EXT = ["mp3", "ogg"];
export const FONT_EXT = ["woff2"];
export const BINARY_IMAGE_EXT = ["gif", "jpeg", "jpg", "png", "webp"];
export const ANY_IMAGE_EXT = ["svg", ...BINARY_IMAGE_EXT];
export const VIDEO_EXT = ["mp4", "webm"];

export const BINARY_ATTACHMENT_EXT = [
  ...AUDIO_EXT,
  ...FONT_EXT,
  ...BINARY_IMAGE_EXT,
  ...VIDEO_EXT,
].sort();

export const ANY_ATTACHMENT_EXT = [
  ...AUDIO_EXT,
  ...FONT_EXT,
  ...ANY_IMAGE_EXT,
  ...VIDEO_EXT,
].sort();

export function createRegExpFromExtensions(...extensions) {
  return new RegExp(`\\.(${extensions.join("|")})$`, "i");
}

export const ANY_ATTACHMENT_REGEXP = createRegExpFromExtensions(
  ...ANY_ATTACHMENT_EXT
);
export const BINARY_ATTACHMENT_REGEXP = createRegExpFromExtensions(
  ...BINARY_ATTACHMENT_EXT
);

// -----
// build
// -----

export const FLAW_LEVELS = Object.freeze({
  ERROR: "error",
  IGNORE: "ignore",
  WARN: "warn",
});

// These names need to match what we have in the code where we have various
// blocks of code that look something like this:
//
//    if (this.options.flawChecks.profanities) {
//      ... analyze and possible add to doc.flaws.profanities ...
//
// This list needs to be synced with the code. And the CLI arguments
// used with --flaw-checks needs to match this set.
export const VALID_FLAW_CHECKS = new Set([
  "macros",
  "broken_links",
  "bad_bcd_queries",
  "images",
  "image_widths",
  "bad_pre_tags",
  "sectioning",
  "heading_links",
  "translation_differences",
  "unsafe_html",
]);

// ------
// client
// ------

export const MDN_PLUS_TITLE = "MDN Plus";
export const CURRICULUM_TITLE = "MDN Curriculum";
export const OBSERVATORY_TITLE = "HTTP Observatory";
export const OBSERVATORY_TITLE_FULL = "HTTP Observatory | MDN";

// -------
// content
// -------

export const HTML_FILENAME = "index.html";
export const MARKDOWN_FILENAME = "index.md";

// ---------
// filecheck
// ---------

export const VALID_MIME_TYPES = new Set([
  "audio/mp4",
  "audio/mpeg",
  "audio/ogg",
  "audio/webm",
  "font/woff2",
  "image/png",
  "image/jpeg", // this is what you get for .jpeg *and* .jpg file extensions
  "image/gif",
  "image/webp",
  "video/mp4",
  "video/ogg",
  "video/webm",
]);

export const MAX_COMPRESSION_DIFFERENCE_PERCENTAGE = 25; // percent
