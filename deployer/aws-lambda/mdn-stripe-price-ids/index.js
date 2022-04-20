const PROD_ENV = "prod";

const regionCodesToCurrency = {
  AS: "USD",
  CA: "USD",
  GB: "USD",
  GU: "USD",
  MP: "USD",
  MY: "USD",
  NZ: "USD",
  PR: "USD",
  SG: "USD",
  US: "USD",
  VI: "USD",
  AT: "EUR",
  BE: "EUR",
  DE: "EUR",
  ES: "EUR",
  FR: "EUR",
  IE: "EUR",
  IT: "EUR",
  NL: "EUR",
  SE: "EUR",
  FI: "EUR",
  CH: "CHF",
};

//##TODO Update to actual prod values.
const PLANS_PROD = {
  USD: {
    mdn_plus_5m: {
      id: "price_1JFoTYKb9q6OnNsLalexa03p",
      monthlyPriceInCents: 500,
    },
    mdn_plus_5y: {
      id: "price_1JpIPwKb9q6OnNsLJLsIqMp7",
      monthlyPriceInCents: 417,
    },
    mdn_plus_10m: {
      id: "price_1K6X7gKb9q6OnNsLi44HdLcC",
      monthlyPriceInCents: 1000,
    },
    mdn_plus_10y: {
      id: "price_1K6X8VKb9q6OnNsLFlUcEiu4",
      monthlyPriceInCents: 833,
    },
  },
  EUR: {
    mdn_plus_5m: {
      id: "price_1Ko6oDKb9q6OnNsL3UV65T60",
      monthlyPriceInCents: 500,
    },
    mdn_plus_5y: {
      id: "price_1Ko6qAKb9q6OnNsLdsHFRRYW",
      monthlyPriceInCents: 417,
    },
    mdn_plus_10m: {
      id: "price_1Ko6rsKb9q6OnNsL9jMzlpUn",
      monthlyPriceInCents: 1000,
    },
    mdn_plus_10y: {
      id: "price_1Ko6stKb9q6OnNsL4rnrw4Wn",
      monthlyPriceInCents: 833,
    },
  },
  GBP: {
    mdn_plus_5m: {
      id: "price_1Ko71LKb9q6OnNsLfA5Rxab7",
      monthlyPriceInCents: 500,
    },
    mdn_plus_5y: {
      id: "price_1Ko72WKb9q6OnNsLHziO3ZDq",
      monthlyPriceInCents: 417,
    },
    mdn_plus_10m: {
      id: "price_1Ko73gKb9q6OnNsLGfHRdyzV",
      monthlyPriceInCents: 1000,
    },
    mdn_plus_10y: {
      id: "price_1Ko74nKb9q6OnNsLBZ0w2KZo",
      monthlyPriceInCents: 833,
    },
  },
  CHF: {
    mdn_plus_5m: {
      id: "price_1Ko6vdKb9q6OnNsLHogCAAEC",
      monthlyPriceInCents: 500,
    },
    mdn_plus_5y: {
      id: "price_1Ko6xTKb9q6OnNsLyKSDZFpO",
      monthlyPriceInCents: 417,
    },
    mdn_plus_10m: {
      id: "price_1Ko6ycKb9q6OnNsLODtL4BlT",
      monthlyPriceInCents: 1000,
    },
    mdn_plus_10y: {
      id: "price_1Ko6zgKb9q6OnNsLuc5eVkuX",
      monthlyPriceInCents: 833,
    },
  },
};

const PLANS_STAGE = {
  USD: {
    mdn_plus_5m: {
      id: "price_1JFoTYKb9q6OnNsLalexa03p",
      monthlyPriceInCents: 500,
    },
    mdn_plus_5y: {
      id: "price_1JpIPwKb9q6OnNsLJLsIqMp7",
      monthlyPriceInCents: 417,
    },
    mdn_plus_10m: {
      id: "price_1K6X7gKb9q6OnNsLi44HdLcC",
      monthlyPriceInCents: 1000,
    },
    mdn_plus_10y: {
      id: "price_1K6X8VKb9q6OnNsLFlUcEiu4",
      monthlyPriceInCents: 833,
    },
  },
  EUR: {
    mdn_plus_5m: {
      id: "price_1Ko6oDKb9q6OnNsL3UV65T60",
      monthlyPriceInCents: 500,
    },
    mdn_plus_5y: {
      id: "price_1Ko6qAKb9q6OnNsLdsHFRRYW",
      monthlyPriceInCents: 417,
    },
    mdn_plus_10m: {
      id: "price_1Ko6rsKb9q6OnNsL9jMzlpUn",
      monthlyPriceInCents: 1000,
    },
    mdn_plus_10y: {
      id: "price_1Ko6stKb9q6OnNsL4rnrw4Wn",
      monthlyPriceInCents: 833,
    },
  },
  GBP: {
    mdn_plus_5m: {
      id: "price_1Ko71LKb9q6OnNsLfA5Rxab7",
      monthlyPriceInCents: 500,
    },
    mdn_plus_5y: {
      id: "price_1Ko72WKb9q6OnNsLHziO3ZDq",
      monthlyPriceInCents: 417,
    },
    mdn_plus_10m: {
      id: "price_1Ko73gKb9q6OnNsLGfHRdyzV",
      monthlyPriceInCents: 1000,
    },
    mdn_plus_10y: {
      id: "price_1Ko74nKb9q6OnNsLBZ0w2KZo",
      monthlyPriceInCents: 833,
    },
  },
  CHF: {
    mdn_plus_5m: {
      id: "price_1Ko6vdKb9q6OnNsLHogCAAEC",
      monthlyPriceInCents: 500,
    },
    mdn_plus_5y: {
      id: "price_1Ko6xTKb9q6OnNsLyKSDZFpO",
      monthlyPriceInCents: 417,
    },
    mdn_plus_10m: {
      id: "price_1Ko6ycKb9q6OnNsLODtL4BlT",
      monthlyPriceInCents: 1000,
    },
    mdn_plus_10y: {
      id: "price_1Ko6zgKb9q6OnNsLuc5eVkuX",
      monthlyPriceInCents: 833,
    },
  },
};

exports.handler = async (event) => {
  const request = event.Records[0].cf.request;
  const ENV = request.origin.custom.customHeaders["x-mdn-env"] || "prod";
  const PLANS = ENV === PROD_ENV ? PLANS_PROD : PLANS_STAGE;

  //https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-cloudfront-headers.html
  const countryHeader = request.headers["cloudfront-viewer-country"];

  const countryCode = countryHeader ? countryHeader[0].value : "US";
  const currency = regionCodesToCurrency[`${countryCode}`] || "USD";

  const content = {
    currency: currency,
    plans: PLANS[currency] || PLANS["USD"],
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
