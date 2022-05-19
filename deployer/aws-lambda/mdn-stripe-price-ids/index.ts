// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'acceptLang... Remove this comment to see the full error message
const acceptLanguageParser = require("accept-language-parser");

const stageLookup = require("./plans-stage-lookup.json");
const prodLookup = require("./plans-prod-lookup.json");

const STAGE_ENV = "stage";

exports.handler = async (event) => {
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
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'recurring' does not exist on type 'unkno... Remove this comment to see the full error message
    if (value.recurring.interval === "year") {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'unit_amount' does not exist on type 'unk... Remove this comment to see the full error message
      monthlyPriceInCents = Math.floor(value.unit_amount / 12);
    } else {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'unit_amount' does not exist on type 'unk... Remove this comment to see the full error message
      monthlyPriceInCents = value.unit_amount;
    }
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'price_id' does not exist on type 'unknow... Remove this comment to see the full error message
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
