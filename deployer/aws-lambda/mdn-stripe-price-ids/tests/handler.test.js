const handler = require("../index");

test("Returns Italian language with Euro price_id for Italian in Germany", async () => {
  const event = getEventForAcceptHeaderAndCountry("it;q=0.7,en;q=0.3", "DE");
  const res = await handler.handler(event);
  const bodyJson = JSON.parse(res.body);
  const expectedPriceArray = [
    "price_1KqeXFJNcmPzuWtRUBiVlTVX",
    "price_1KqeXFJNcmPzuWtRjdDWnMU6",
    "price_1KqeXFJNcmPzuWtR2UJ1TVSG",
    "price_1KqeXGJNcmPzuWtR7cw3rh90",
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
    "price_1KqeXFJNcmPzuWtRUBiVlTVX",
    "price_1KqeXFJNcmPzuWtRjdDWnMU6",
    "price_1KqeXFJNcmPzuWtR2UJ1TVSG",
    "price_1KqeXGJNcmPzuWtR7cw3rh90",
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
    "price_1KqeXLJNcmPzuWtRyS2uTKyE",
    "price_1KqeXLJNcmPzuWtRbH6wD6sm",
    "price_1KqeXMJNcmPzuWtR46VuMNtb",
    "price_1KqeXMJNcmPzuWtR3bNmxM4C",
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
    "price_1KeG02JNcmPzuWtR1oBrw8o6",
    "price_1KeG02JNcmPzuWtRslZijhQu",
    "price_1KeG02JNcmPzuWtRuAnIgNHh",
    "price_1KeG02JNcmPzuWtRlrSiLTI6",
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
