import acceptLanguageParser from "accept-language-parser";
import stageLookup from "./plans-stage-lookup.json";
import prodLookup from "./plans-prod-lookup.json";

const STAGE_ENV = "stage";

export const handler = async (event) => {
  const request = event.Records[0].cf.request;
  //This should fail if this header is not set.
  const ENV =
    request.origin.custom.customHeaders["x-mdn-env"][0].value || "prod";
  //Always fall back to prod
  const lookupData = ENV === STAGE_ENV ? stageLookup : prodLookup;

  //https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-cloudfront-headers.html
  const countryHeader = request.headers["cloudfront-viewer-country"];

  const localeHeader = request.headers["accept-language"];

  const countryCode = countryHeader ? countryHeader[0].value : "US";
  const supportedCurrency = lookupData.countryToCurrency[countryCode];

  if (!supportedCurrency) {
    return {
      status: 404,
      statusDescription: "NOT_OK",
    };
  }

  let acceptLanguage = localeHeader ? localeHeader[0].value : null;
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
  const planData = {};
  Object.entries(plans).forEach(([key, value]) => {
    let monthlyPriceInCents;
    if (value.recurring.interval === "year") {
      monthlyPriceInCents = Math.floor(value.unit_amount / 12);
    } else {
      monthlyPriceInCents = value.unit_amount;
    }
    planData[key] = { monthlyPriceInCents, id: value.price_id };
  });

  const content = {
    currency: supportedCurrency.currency,
    plans: planData,
  };

  const response = {
    status: 200,
    statusDescription: "OK",
    headers: {
      "cache-control": [
        {
          key: "Cache-Control",
          value: "max-age=86400",
        },
      ],
      "content-type": [
        {
          key: "Content-Type",
          value: "application/json",
        },
      ],
    },
    body: JSON.stringify(content),
  };

  return response;
};
