import type express from "express";

import { createRequire } from "node:module";
import acceptLanguageParser from "accept-language-parser";
import { ORIGIN_MAIN } from "../env.js";

const require = createRequire(import.meta.url);

const stageLookup = require("./plans-stage-lookup.json") satisfies LookupData;
const prodLookup = require("./plans-prod-lookup.json") satisfies LookupData;

type CountryCode = string;
type LanguageCode = string;
type CurrencyCode = string;
type ProductId = string;
type PriceId = string;

interface Plan {
  unit_amount: number;
  currency: CurrencyCode;
  product: ProductId;
  recurring: {
    interval: "month" | "year";
  };
  nickname: string;
  lookup_key: string;
  metadata: { [key: string]: string };
  price_id: PriceId;
}
interface LookupData {
  countryToCurrency: {
    [countryCode: CountryCode]: {
      currency: CurrencyCode;
      supportedLanguages: {
        [languageCode: LanguageCode]: null | {
          [key: string]: string;
        };
      };
      defaultLanguage: LanguageCode;
    };
  };
  langCurrencyToPlans: {
    [langCurrencyCode: string]: {
      [name: string]: Plan;
    };
  };
}

interface PlanResult {
  [name: string]: { monthlyPriceInCents: number; id: string };
}
interface Result {
  country: CountryCode;
  currency: CurrencyCode;
  plans: PlanResult;
}

export function stripePlans(req: express.Request, res: express.Response) {
  const lookupData: LookupData =
    ORIGIN_MAIN === "developer.mozilla.org" ? prodLookup : stageLookup;

  // https://cloud.google.com/appengine/docs/flexible/reference/request-headers#app_engine-specific_headers
  const countryHeader = req.headers["x-appengine-country"];
  const localeHeader = req.headers["accept-language"];

  const countryCode =
    typeof countryHeader === "string" && countryHeader !== "ZZ"
      ? countryHeader
      : "US";

  const supportedCurrency = lookupData.countryToCurrency[countryCode];

  if (!supportedCurrency) {
    return res.status(404);
  }

  const acceptLanguage = typeof localeHeader === "string" ? localeHeader : null;

  let supportedLanguageOrDefault;
  if (acceptLanguage) {
    //E.g "en-GB,en;q=0.7,it;q=0.3" - Takes 'en'
    supportedLanguageOrDefault =
      acceptLanguageParser.pick(
        Object.keys(supportedCurrency.supportedLanguages),
        acceptLanguage,
        { loose: true }
      ) || supportedCurrency.defaultLanguage;
  } else {
    supportedLanguageOrDefault = supportedCurrency.defaultLanguage;
  }

  const key = `${supportedCurrency.currency}-${supportedLanguageOrDefault}`;

  const plans = lookupData.langCurrencyToPlans[key];
  if (!plans) {
    return res.status(500);
  }

  const planResult: PlanResult = {};
  Object.entries(plans).forEach(([name, plan]) => {
    let monthlyPriceInCents;
    if (plan.recurring.interval === "year") {
      monthlyPriceInCents = Math.floor(plan.unit_amount / 12);
    } else {
      monthlyPriceInCents = plan.unit_amount;
    }
    planResult[name] = { monthlyPriceInCents, id: plan.price_id };
  });

  const result = {
    country: countryCode,
    currency: supportedCurrency.currency,
    plans: planResult,
  } satisfies Result;

  return res
    .status(200)
    .setHeader("Cache-Control", "max-age=86400")
    .setHeader("Content-Type", "application/json")
    .end(JSON.stringify(result));
}
