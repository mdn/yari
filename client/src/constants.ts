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

export const MDN_PLUS_TITLE = "MDN Plus";

export const PLUS_IS_ENABLED = Boolean(
  process.env.REACT_APP_ENABLE_PLUS || "false"
);
export const PLUS_IS_AVAILABLE_OVERRIDE = JSON.parse(
  process.env.REACT_APP_PLUS_IS_AVAILABLE_OVERRIDE || "null"
);

export const MDN_PLUS_SUBSCRIBE_5M_URL = `${process.env.REACT_APP_MDN_PLUS_SUBSCRIBE_URL}?plan=${process.env.REACT_APP_MDN_PLUS_5M_PLAN}`;
export const MDN_PLUS_SUBSCRIBE_5Y_URL = `${process.env.REACT_APP_MDN_PLUS_SUBSCRIBE_URL}?plan=${process.env.REACT_APP_MDN_PLUS_5Y_PLAN}`;
export const MDN_PLUS_SUBSCRIBE_10M_URL = `${process.env.REACT_APP_MDN_PLUS_SUBSCRIBE_URL}?plan=${process.env.REACT_APP_MDN_PLUS_10M_PLAN}`;
export const MDN_PLUS_SUBSCRIBE_10Y_URL = `${process.env.REACT_APP_MDN_PLUS_SUBSCRIBE_URL}?plan=${process.env.REACT_APP_MDN_PLUS_10Y_PLAN}`;
export const MDN_PLUS_SUBSCRIBE_BASE =
  process.env.REACT_APP_MDN_PLUS_SUBSCRIBE_URL ||
  "https://accounts.stage.mozaws.net/subscriptions/products/prod_Jtbg9tyGyLRuB0";

export const FXA_SIGNIN_URL = process.env.REACT_APP_FXA_SIGNIN_URL || "";
export const FXA_SETTINGS_URL = process.env.REACT_APP_FXA_SETTINGS_URL || "";
export const FXA_MANAGE_SUBSCRIPTIONS_URL =
  process.env.REACT_APP_FXA_MANAGE_SUBSCRIPTIONS_URL ||
  "https://accounts.stage.mozaws.net/subscriptions/";

export const DEFAULT_GEO_COUNTRY =
  process.env.REACT_APP_DEFAULT_GEO_COUNTRY || "United States";

export const ENABLE_PLUS_EU = Boolean(
  JSON.parse(process.env.REACT_APP_ENABLE_PLUS_EU || "false")
);

export const PLUS_ENABLED_COUNTRIES =
  process.env.REACT_APP_PLUS_ENABLED_COUNTRIES?.split(",") || [
    "United States",
    "Canada",
  ];

export const IEX_DOMAIN =
  process.env.REACT_APP_INTERACTIVE_EXAMPLES_BASE_URL ||
  "https://interactive-examples.mdn.mozilla.net";

export const HEADER_NOTIFICATIONS_MENU_API_URL =
  "/api/v1/plus/notifications/?limit=1&unread=true";

export const UPDATES_BASE_URL =
  process.env.REACT_APP_UPDATES_BASE_URL ||
  "https://updates.developer.allizom.org";
