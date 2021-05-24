export const DISABLE_AUTH = JSON.parse(
  process.env.REACT_APP_DISABLE_AUTH || "false"
);

export const CRUD_MODE = JSON.parse(
  process.env.REACT_APP_CRUD_MODE ||
    JSON.stringify(process.env.NODE_ENV === "development")
);

export const CRUD_MODE_HOSTNAMES = (
  process.env.REACT_APP_CRUD_MODE_HOSTNAMES ||
  "localhost,localhost.org,127.0.0.1"
)
  .split(",")
  .map((x) => x.trim())
  .filter(Boolean);

export const AUTOCOMPLETE_SEARCH_WIDGET = JSON.parse(
  process.env.REACT_APP_AUTOCOMPLETE_SEARCH_WIDGET || JSON.stringify(CRUD_MODE)
);

// Remember to keep this in sync with the list inside the Node code.
// E.g. libs/constants.js
// Hardcoding the list in both places is most convenient and most performant.
// We could encode the list in the SSR rendering but that means the client side
// code needs to depend on having access to the `window` global first.
export const VALID_LOCALES = new Set([
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
]);

export const ENABLE_PLUS = JSON.parse(
  process.env.REACT_APP_ENABLE_PLUS ||
    JSON.stringify(process.env.NODE_ENV === "development")
);

export const DEFAULT_GEO_COUNTRY =
  process.env.REACT_APP_DEFAULT_GEO_COUNTRY || "United States";
