const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, "..", process.env.ENV_FILE || ".env"),
});

const CONTENT_ROOT = process.env.CONTENT_ROOT
  ? path.join(__dirname, "..", process.env.CONTENT_ROOT)
  : path.join(__dirname, "..", "content", "files");

const CONTENT_ARCHIVE_ROOT = process.env.CONTENT_ARCHIVE_ROOT
  ? path.join(__dirname, "..", process.env.CONTENT_ARCHIVE_ROOT)
  : null;

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
  CONTENT_ARCHIVE_ROOT,
  VALID_LOCALES,
};
