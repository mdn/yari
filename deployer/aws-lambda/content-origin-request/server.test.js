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

describe("root URL redirects", () => {
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

  it("should redirect with a trailing slash when cased correctly", async () => {
    const r = await get("/en-US");
    expect(r.statusCode).toBe(302);
    expect(r.headers["location"]).toBe("/en-US/");
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

describe("URLs that need a locale injected", () => {
  it("should inject the locale depending on first prefix", async () => {
    expect.assertions(3 * 2);
    for (const prefix of ["search", "signin", "signup"]) {
      const r = await get(`/${prefix}`);
      expect(r.statusCode).toBe(302);
      expect(r.headers["location"]).toBe(`/en-US/${prefix}`);
    }
  });
  it("should inject the locale depending on first prefix and drop any trailing slash", async () => {
    expect.assertions(3 * 2);
    for (const prefix of ["search", "signin", "signup"]) {
      const r = await get(`/${prefix}/`);
      expect(r.statusCode).toBe(302);
      expect(r.headers["location"]).toBe(`/en-US/${prefix}`);
    }
  });
  it("should inject the locale for /docs URLs", async () => {
    const r = await get("/docs/Web");
    expect(r.statusCode).toBe(302);
    expect(r.headers["location"]).toBe(`/en-US/docs/Web`);
  });
});

describe("home page redirects", () => {
  it("should case correct the locale", async () => {
    const r = await get("/En-Us/");
    expect(r.statusCode).toBe(302);
    expect(r.headers["location"]).toBe("/en-US/");
  });
  it("should case correct the locale when incorrect and lacking trailing slash", async () => {
    const r = await get("/En-Us");
    expect(r.statusCode).toBe(302);
    expect(r.headers["location"]).toBe("/en-US/");
  });
  it("should case correct the locale and respect query strings", async () => {
    const r = await get("/En-Us?foo=bar");
    expect(r.statusCode).toBe(302);
    expect(r.headers["location"]).toBe("/en-US/?foo=bar");
  });
  it("should case correct the locale and respect query strings and keep slash", async () => {
    const r = await get("/En-Us/?foo=bar");
    expect(r.statusCode).toBe(302);
    expect(r.headers["location"]).toBe("/en-US/?foo=bar");
  });
  it("should case correct the locale leave the rest of the URL as is", async () => {
    const r = await get("/En-Us/docs/Web");
    expect(r.statusCode).toBe(302);
    expect(r.headers["location"]).toBe("/en-US/docs/Web");
  });
  it("should case correct the locale leave the rest of the URL and query string as is", async () => {
    const r = await get("/En-Us/docs/Web?foo=bar");
    expect(r.statusCode).toBe(302);
    expect(r.headers["location"]).toBe("/en-US/docs/Web?foo=bar");
  });
});

describe("remove trailing slash before doing an S3 lookup", () => {
  it("should remove trailing slash on docs lookups", async () => {
    const r = await get("/en-US/docs/Web/CSS/");
    expect(r.statusCode).toBe(302);
    expect(r.headers["location"]).toBe("/en-US/docs/Web/CSS");
  });
});

describe("legacy kumaesque prefixes should be left alone", () => {
  it("should not touch /accounts/whatever", async () => {
    const r = await get("/accounts/Whatever");
    expect(r.statusCode).toBe(200);
  });
  it("should not touch trailing slash on these /accounts/whatever/", async () => {
    const r = await get("/accounts/Whatever");
    expect(r.statusCode).toBe(200);
  });
});

describe("always check for fundamental redirects first", () => {
  it("should inject /docs/ in certain prefixes", async () => {
    expect.assertions(3 * 3);
    for (const prefix of ["DOM", "Javascript", "css"]) {
      const r = await get(`/en-US/${prefix}`);
      expect(r.statusCode).toBe(301);
      expect(r.headers["location"]).toBe(`/en-US/docs/${prefix}`);
      expect(r.headers["cache-control"]).toMatch(/max-age=\d\d+/);
    }
  });
  it("should inject /docs/ in certain prefixes and preserve query strings", async () => {
    expect.assertions(3 * 3);
    for (const prefix of ["DOM", "Javascript", "css"]) {
      const r = await get(`/en-US/${prefix}?foo=bar`);
      expect(r.statusCode).toBe(301);
      expect(r.headers["location"]).toBe(`/en-US/docs/${prefix}?foo=bar`);
      expect(r.headers["cache-control"]).toMatch(/max-age=\d\d+/);
    }
  });
});
