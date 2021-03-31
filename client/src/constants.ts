export const DISABLE_AUTH = JSON.parse(
  process.env.REACT_APP_DISABLE_AUTH || "false"
);

export const CRUD_MODE = JSON.parse(
  process.env.REACT_APP_CRUD_MODE ||
    JSON.stringify(process.env.NODE_ENV === "development")
);

export const CRUD_MODE_READONLY = JSON.parse(
  process.env.REACT_APP_CRUD_MODE_READONLY || "false"
);

export const AUTOCOMPLETE_SEARCH_WIDGET = JSON.parse(
  process.env.REACT_APP_AUTOCOMPLETE_SEARCH_WIDGET || JSON.stringify(CRUD_MODE)
);

// Remember to keep this in sync with the list inside the Node code.
// E.g. libs/constants.js
// Hardcoding the list in both places is most convenient and most performant.
// We could encode the list in the SSR rendering but that means the client side
// code needs to depend on having access to the `window` global first.
export const VALID_LOCALES = new Set([
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
]);
