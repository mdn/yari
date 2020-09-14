const fs = require("fs");
const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, "..", process.env.ENV_FILE || ".env"),
});

const CONTENT_ROOT = process.env.CONTENT_ROOT;
console.assert(CONTENT_ROOT, "Env var CONTENT_ROOT must be set");

const CONTENT_ARCHIVED_ROOT = process.env.CONTENT_ARCHIVED_ROOT;
const CONTENT_TRANSLATED_ROOT = process.env.CONTENT_TRANSLATED_ROOT;

// Make a combined array of all truthy roots. This way, you don't
// need to constantly worry about CONTENT_ARCHIVED_ROOT potentially being
// null.
const ROOTS = [CONTENT_ROOT];
if (CONTENT_ARCHIVED_ROOT) {
  ROOTS.push(CONTENT_ARCHIVED_ROOT);
}
if (CONTENT_TRANSLATED_ROOT) {
  ROOTS.push(CONTENT_TRANSLATED_ROOT);
}

const VALID_LOCALES = new Map(
  [
    "ar",
    "bg",
    "bm",
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

module.exports = {
  CONTENT_ROOT,
  CONTENT_ARCHIVED_ROOT,
  CONTENT_TRANSLATED_ROOT,
  ROOTS,
  VALID_LOCALES,
};
