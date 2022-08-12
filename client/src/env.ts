// Client environment based on REACT_APP_* environment variables.
//
// Note:
// - We cannot use any other variables from the .env file.
// - We cannot use /libs/env, because fs/path are not available client-side.

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

export const KUMA_HOST =
  process.env.REACT_APP_KUMA_HOST || "developer.mozilla.org";

export const PLUS_IS_ENABLED = Boolean(
  process.env.REACT_APP_ENABLE_PLUS || "false"
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

export const IEX_DOMAIN =
  process.env.REACT_APP_INTERACTIVE_EXAMPLES_BASE_URL ||
  "https://interactive-examples.mdn.mozilla.net";

export const UPDATES_BASE_URL =
  process.env.REACT_APP_UPDATES_BASE_URL ||
  "https://updates.developer.allizom.org";

// TODO Inline after 2022-07-01.
export function survey_duration(surveyBucket: string): {
  start: number;
  end: number;
} {
  const start = Number(
    process.env[`REACT_APP_SURVEY_START_${surveyBucket}`] || 0
  );
  const end = Number(
    process.env[`REACT_APP_SURVEY_END_${surveyBucket}`] || Infinity
  );
  return { start, end };
}

export function survey_rates(surveyKey: string): {
  rateFrom: number;
  rateTill: number;
} {
  const rateFrom = Number(
    process.env[`REACT_APP_SURVEY_RATE_FROM_${surveyKey}`] || 0
  );
  const rateTill = Number(
    process.env[`REACT_APP_SURVEY_RATE_TILL_${surveyKey}`] || 1
  );
  return { rateFrom, rateTill };
}
