/* eslint-disable node/no-unpublished-require */
/* eslint-disable node/no-missing-require */
const got = require("got");

const BASE_URL = process.env.SERVER_BASE_URL || "http://localhost:7000";

function getURL(uri) {
  return `${BASE_URL}${uri}`;
}

async function get(uri, headers = {}) {
  const response = await got(getURL(uri), {
    headers,
    followRedirect: false,
    retry: 0,
  });
  return response;
}

describe("home page redirects", () => {
  it("should redirect to the locale home page", async () => {
    const r = await get("/");
    expect(r.statusCode).toBe(302);
    expect(r.headers["location"]).toBe("/en-US/");
  });

  it("should preserve the query string", async () => {
    const r = await get("/?foo=bar");
    expect(r.statusCode).toBe(302);
    expect(r.headers["location"]).toBe("/en-US/?foo=bar");
  });

  it("should should respect the 'Accept-language' header", async () => {
    const r = await get("/", {
      "Accept-language": "fr",
    });
    expect(r.statusCode).toBe(302);
    expect(r.headers["location"]).toBe("/fr/");
  });

  it("should should respect the 'preferredlocale' cookie", async () => {
    const r = await get("/", {
      Cookie: "preferredlocale=fr",
    });
    expect(r.statusCode).toBe(302);
    expect(r.headers["location"]).toBe("/fr/");
  });

  it("should should respect the cookie more than 'Accept-language'", async () => {
    const r = await get("/", {
      Cookie: "preferredlocale=fr",
      "Accept-language": "zh-Cn",
    });
    expect(r.statusCode).toBe(302);
    expect(r.headers["location"]).toBe("/fr/");
  });
});

describe("home page redirects", () => {
  it("should case correct the locale", async () => {
    const r = await get("/En-Us");
    expect(r.statusCode).toBe(302);
    expect(r.headers["location"]).toBe("/en-US/");
  });
});
