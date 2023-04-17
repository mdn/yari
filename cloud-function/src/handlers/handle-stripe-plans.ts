import acceptLanguageParser from "accept-language-parser";
import { Request, Response } from "express";

import { ORIGIN_MAIN } from "../env.js";
import { getRequestCountry } from "../utils.js";
import stageLookup from "../stripe-plans/stage.js";
import prodLookup from "../stripe-plans/prod.js";

interface PlanResult {
  [name: string]: { monthlyPriceInCents: number; id: string };
}
interface Result {
  country: string;
  currency: string;
  plans: PlanResult;
}

export async function handleStripePlans(req: Request, res: Response) {
  const lookupData =
    ORIGIN_MAIN === "developer.mozilla.org" ? prodLookup : stageLookup;

  const localeHeader = req.headers["accept-language"];

  const countryCode = getRequestCountry(req);

  const supportedCurrency = lookupData.countryToCurrency[countryCode];

  if (!supportedCurrency) {
    return res.status(404).end();
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
    return res.status(500).end();
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

  return (
    res
      .status(200)
      // Google CDN cannot partition by country, so we can only cache in browser.
      .setHeader("Cache-Control", "private, max-age=86400")
      .setHeader("Content-Type", "application/json")
      .end(JSON.stringify(result))
  );
}
