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
    throwHttpErrors: false,
  });
  return response;
}

describe("root URL redirects", () => {
  it("should redirect to the locale home page", async () => {
    const r = await get("/");
    expect(r.statusCode).toBe(302);
    expect(r.headers["location"]).toBe("/en-US/");
  });

  it("should preserve the basic query string", async () => {
    const r = await get("/?foo=bar");
    expect(r.statusCode).toBe(302);
    expect(r.headers["location"]).toBe("/en-US/?foo=bar");
  });

  it("should preserve the query string and not encode it twice", async () => {
    // This test is based on https://github.com/mdn/yari/issues/3425
    const r = await get("/?q=text%2Dshadow");
    expect(r.statusCode).toBe(302);
    expect(r.headers["location"]).toBe("/en-US/?q=text%2Dshadow");
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
  const spaPrefixes = ["search", "signin", "signup", "settings", "plus"];
  it("should inject the locale depending on first prefix", async () => {
    expect.assertions(spaPrefixes.length * 2);
    for (const prefix of spaPrefixes) {
      const r = await get(`/${prefix}`);
      expect(r.statusCode).toBe(302);
      expect(r.headers["location"]).toBe(`/en-US/${prefix}`);
    }
  });
  it("should inject the locale depending on first prefix by header", async () => {
    expect.assertions(spaPrefixes.length * 2);
    for (const prefix of spaPrefixes) {
      const r = await get(`/${prefix}`, {
        "Accept-language": "zh-Cn",
      });
      expect(r.statusCode).toBe(302);
      expect(r.headers["location"]).toBe(`/zh-CN/${prefix}`);
    }
  });
  it("should inject the locale depending on first prefix by cookie", async () => {
    expect.assertions(spaPrefixes.length * 2);
    for (const prefix of spaPrefixes) {
      const r = await get(`/${prefix}`, {
        Cookie: "preferredlocale=fr",
      });
      expect(r.statusCode).toBe(302);
      expect(r.headers["location"]).toBe(`/fr/${prefix}`);
    }
  });
  it("should inject the locale depending on first prefix by cookie over header", async () => {
    expect.assertions(spaPrefixes.length * 2);
    for (const prefix of spaPrefixes) {
      const r = await get(`/${prefix}`, {
        "Accept-language": "zh-Cn",
        Cookie: "preferredlocale=fr",
      });
      expect(r.statusCode).toBe(302);
      expect(r.headers["location"]).toBe(`/fr/${prefix}`);
    }
  });
  it("should preserve query string when injecting locale", async () => {
    const r = await get("/search?q=foo");
    expect(r.statusCode).toBe(302);
    expect(r.headers["location"]).toBe(`/en-US/search?q=foo`);
  });
  it("should inject the locale depending on first prefix and drop any trailing slash", async () => {
    expect.assertions(spaPrefixes.length * 2);
    for (const prefix of spaPrefixes) {
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
  it("should not touch trailing slash on /maintenance-mode/", async () => {
    const r = await get("/maintenance-mode/");
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
});

describe("redirect double-slash prefix URIs", () => {
  it("should 302 redirect anything that starts with //", async () => {
    const r = await get(`//en-US/search/`);
    expect(r.statusCode).toBe(302);
    expect(r.headers["location"]).toBe("/en-US/search/");
  });
  it("should 302 redirect anything that starts with // on anything", async () => {
    const r = await get(`//blablabla`);
    expect(r.statusCode).toBe(302);
    expect(r.headers["location"]).toBe("/blablabla");
  });
});

describe("retired locale redirects", () => {
  it("should 302 redirect a retired locale (accept-language)", async () => {
    const r = await get("/", {
      "Accept-language": "sv-SE",
    });
    expect(r.statusCode).toBe(302);
    expect(r.headers["location"]).toBe("/en-US/");
  });
  it("should 302 redirect a retired locale (preferredlocale cookie)", async () => {
    const r = await get("/docs/Web/HTTP", {
      Cookie: "preferredlocale=it",
    });
    expect(r.statusCode).toBe(302);
    expect(r.headers["location"]).toBe("/en-US/docs/Web/HTTP");
  });
  it("should 302 redirect a retired locale (no query string)", async () => {
    const r = await get("/sv-SE/docs/Web/HTML");
    expect(r.statusCode).toBe(302);
    expect(r.headers["location"]).toBe(
      "/en-US/docs/Web/HTML?retiredLocale=sv-SE"
    );
  });
  it("should 302 redirect a retired locale (query string, improper locale)", async () => {
    const r = await get("/BN/search?q=video");
    expect(r.statusCode).toBe(302);
    expect(r.headers["location"]).toBe(
      "/en-US/search?retiredLocale=bn&q=video"
    );
  });
});

describe("response headers", () => {
  it("should not set CSP or X-Frame-Options for legacy /_samples_/", async () => {
    const r = await get("/en-US/docs/Web/HTTP/_samples_/Foo/index.html");
    expect(r.statusCode).toBe(200);
    expect(r.headers["x-frame-options"]).toBeFalsy();
    expect(r.headers["content-security-policy"]).toBeFalsy();
  });

  it("should not set CSP or X-Frame-Options for /_sample.*", async () => {
    const r = await get("/en-US/docs/Web/HTTP/_sample_.Foo.html");
    expect(r.statusCode).toBe(200);
    expect(r.headers["x-frame-options"]).toBeFalsy();
    expect(r.headers["content-security-policy"]).toBeFalsy();
  });

  it("should set CSP and other security headers for non-samples (stage)", async () => {
    const r = await get("/en-US/docs/Web/HTTP", {
      origin_domain_name:
        "mdn-content-stage.s3-website-us-west-2.amazonaws.com",
    });
    expect(r.statusCode).toBe(200);
    expect(r.headers["x-frame-options"]).toBeTruthy();
    expect(r.headers["strict-transport-security"]).toBeTruthy();
    expect(r.headers["x-xss-protection"]).toBeTruthy();
    expect(r.headers["content-security-policy"]).toBeTruthy();
  });
  it("should set CSP and other security headers for non-samples (prod)", async () => {
    const r = await get("/en-US/docs/Web/HTTP", {
      origin_domain_name: "mdn-content-prod.s3-website-us-west-2.amazonaws.com",
    });
    expect(r.statusCode).toBe(200);
    expect(r.headers["x-frame-options"]).toBeTruthy();
    expect(r.headers["strict-transport-security"]).toBeTruthy();
    expect(r.headers["x-xss-protection"]).toBeTruthy();
    expect(r.headers["content-security-policy"]).toBeTruthy();
  });
  it("should not set CSP but other security headers non-HTML", async () => {
    const r = await get("/en-US/docs/Web/HTTP/screenshot.png");
    expect(r.statusCode).toBe(200);
    expect(r.headers["x-frame-options"]).toBeTruthy();
    expect(r.headers["strict-transport-security"]).toBeTruthy();
    expect(r.headers["x-xss-protection"]).toBeTruthy();
    expect(r.headers["content-security-policy"]).toBeFalsy();
  });
});
