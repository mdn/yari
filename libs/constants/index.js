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
  ["bn-bd", "bn"],
  ["ja-jp", "ja"],
  ["pt", "pt-PT"], // Note! Portugal Portugese is the default
  ["cn", "zh-cn"],
  ["zh", "zh-tw"],
]);

module.exports = {
  VALID_LOCALES,
  DEFAULT_LOCALE,
  LOCALE_ALIASES,
};
