const handler = require("../index");
jest.mock("../plans-stage-lookup.json", () => {
  return require("./__mocks__/plans-stage-lookup-test.json");
});
jest.mock("../plans-prod-lookup.json", () => {
  return require("./__mocks__/plans-prod-lookup-test.json");
});

test("Returns Italian language with Euro price_id for Italian in Germany", async () => {
  const event = getEventForAcceptHeaderAndCountry("it;q=0.7,en;q=0.3", "DE");
  const res = await handler.handler(event);
  const bodyJson = JSON.parse(res.body);
  const expectedPriceArray = [
    "ITALIAN_1",
    "ITALIAN_2",
    "ITALIAN_3",
    "ITALIAN_4",
  ];

  expect(Object.values(bodyJson.plans).map((val) => val.id)).toEqual(
    expect.arrayContaining(expectedPriceArray)
  );
});

test("(PROD) Returns Italian language with Euro price_id for Italian in Germany", async () => {
  const event = getEventForAcceptHeaderAndCountry(
    "it;q=0.7,en;q=0.3",
    "DE",
    "prod"
  );
  const res = await handler.handler(event);
  const bodyJson = JSON.parse(res.body);
  const expectedPriceArray = [
    "ITALIAN_1",
    "ITALIAN_2",
    "ITALIAN_3",
    "ITALIAN_4",
  ];

  expect(Object.values(bodyJson.plans).map((val) => val.id)).toEqual(
    expect.arrayContaining(expectedPriceArray)
  );
});

test("Returns French language with CHF price_id for Swiss person in Switzerland", async () => {
  //French dialect in Switzerland
  const event = getEventForAcceptHeaderAndCountry("fr-CA;q=0.7,en;q=0.3", "CH");
  const res = await handler.handler(event);
  const bodyJson = JSON.parse(res.body);
  const expectedPriceArray = [
    "SWISS_FRENCH_1",
    "SWISS_FRENCH_2",
    "SWISS_FRENCH_3",
    "SWISS_FRENCH_4",
  ];

  expect(Object.values(bodyJson.plans).map((val) => val.id)).toEqual(
    expect.arrayContaining(expectedPriceArray)
  );
});

test("Returns English (default) language with USD price_id for German person in USA", async () => {
  //French dialect in Switzerland
  const event = getEventForAcceptHeaderAndCountry("de;q=1.0", "US");
  const res = await handler.handler(event);
  const bodyJson = JSON.parse(res.body);
  const expectedPriceArray = [
    "USD_ENGLISH_1",
    "USD_ENGLISH_2",
    "USD_ENGLISH_3",
    "USD_ENGLISH_4",
  ];

  expect(Object.values(bodyJson.plans).map((val) => val.id)).toEqual(
    expect.arrayContaining(expectedPriceArray)
  );
});

test("Returns 404 for unsupported country", async () => {
  //British user in the Falklands
  const event = getEventForAcceptHeaderAndCountry("en-GB;q=1", "FK");
  const res = await handler.handler(event);
  expect(res.status).toEqual(404);
});

function getEventForAcceptHeaderAndCountry(
  acceptLanguageHeaderValue,
  countryCode,
  env = "stage"
) {
  return {
    Records: [
      {
        cf: {
          request: {
            uri: "/api/v1/stripe/plans",
            method: "GET",
            clientIp: "192.168.0.1",
            origin: {
              custom: {
                customHeaders: {
                  "x-mdn-env": `${env}`,
                },
              },
            },
            headers: {
              "accept-language": [
                {
                  key: "Accept-Language",
                  value: `${acceptLanguageHeaderValue}`,
                },
              ],
              "cloudfront-viewer-country": [
                {
                  key: "CloudFront-Viewer-Country",
                  value: `${countryCode}`,
                },
              ],
            },
          },
        },
      },
    ],
  };
}
