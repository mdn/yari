export const DISABLE_AUTH = Boolean(
  JSON.parse(process.env.REACT_APP_DISABLE_AUTH || "false")
);

export const CRUD_MODE = Boolean(
  JSON.parse(
    process.env.REACT_APP_CRUD_MODE ||
      JSON.stringify(process.env.NODE_ENV === "development")
  )
);

export const CRUD_MODE_HOSTNAMES = (
  process.env.REACT_APP_CRUD_MODE_HOSTNAMES ||
  "localhost,localhost.org,127.0.0.1"
)
  .split(",")
  .map((x) => x.trim())
  .filter(Boolean);

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

export const ENABLE_PLUS = Boolean(
  JSON.parse(
    process.env.REACT_APP_ENABLE_PLUS ||
      JSON.stringify(process.env.NODE_ENV === "development")
  )
);
export const MDN_PLUS_SUBSCRIBE_MONTHLY_URL = `${process.env.REACT_APP_MDN_PLUS_SUBSCRIBE_URL}?plan=${process.env.REACT_APP_MDN_PLUS_MONTHLY_PLAN}`;

export const FXA_SIGNIN_URL = process.env.REACT_APP_FXA_SIGNIN_URL || "";
export const FXA_SETTINGS_URL = process.env.REACT_APP_FXA_SETTINGS_URL || "";

export const DEFAULT_GEO_COUNTRY =
  process.env.REACT_APP_DEFAULT_GEO_COUNTRY || "United States";
