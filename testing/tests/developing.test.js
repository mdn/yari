const got = require("got");
const { setDefaultOptions } = require("expect-puppeteer");

// The default it 500ms. Building and running these pages can be pretty slow
// since the rendering both involves create-react-app bundling the test page,
// and then the server building of the page can be pretty heavy.
setDefaultOptions({ timeout: 5000 });

const DEV_BASE_URL =
  process.env.DEVELOPING_DEV_BASE_URL || "http://localhost:3000";

function devURL(pathname = "/") {
  return `${DEV_BASE_URL}${pathname}`;
}

const SERVER_BASE_URL =
  process.env.DEVELOPING_SERVER_BASE_URL || "http://localhost:5000";
function serverURL(pathname = "/") {
  return `${SERVER_BASE_URL}${pathname}`;
}

const SKIP_DEV_URL = JSON.parse(process.env.DEVELOPING_SKIP_DEV_URL || "false");

// This "trick" is to force every test to be skipped if the environment
// variable hasn't been set. This way, when you run `jest ...`, and it finds
// all `**/*.test.js` it doesn't actually run these tests unless explicitly
// prepared to do so.
// The source of this idea comes from https://github.com/facebook/jest/issues/7245
const isTesting = JSON.parse(process.env.TESTING_DEVELOPING || "false");
const withDeveloping = isTesting ? it : it.skip;
// If the test suite runs in a way that there's no separate dev server,
// don't bother using the `DEV_BASE_URL`.
// For example, when it tests the `npm pack` tarball, it's starting only
// the one server (on `localhost:5000`) that suite will set the `DEV_BASE_URL`
// to be the same as `SAME_BASE_URL`.
// In conclusion, if there's only 1 base URL to test again; don't test both.
const withCrud = isTesting && !SKIP_DEV_URL ? it : it.skip;

describe("Testing the kitchensink page", () => {
  withCrud("open the page", async () => {
    await page.goto(devURL("/en-US/docs/MDN/Kitchensink"));
    await expect(page).toMatch("The MDN Content Kitchensink");
    await expect(page).toMatch("No known flaws at the moment");
  });

  withCrud("open a file attachement directly in the dev URL", async () => {
    await page.goto(devURL("/en-US/docs/MDN/Kitchensink/iceberg.jpg"));
    // This is how Chromium makes a document title when viewing an image.
    expect(await page.title()).toBe("iceberg.jpg (1400×1050)");
    // Unfortunately, there's no API in puppeteer to test that the image URL
    // you opened of correct type or file size or even HTTP status code.
    expect(page.url()).toBe(devURL("/en-US/docs/MDN/Kitchensink/iceberg.jpg"));
  });

  withDeveloping("server-side render HTML", async () => {
    // You can go to the page directly via the server
    await page.goto(serverURL("/en-US/docs/MDN/Kitchensink"), {
      // This is necessary because the page contains lazy loading iframes
      // to external domains.
      waitUntil: "networkidle0",
    });
    await expect(page).toMatch("The MDN Content Kitchensink");
  });

  withDeveloping("server-side render HTML", async () => {
    // Loading the index.json doesn't require a headless browser
    const { doc } = await got(
      serverURL("/en-US/docs/MDN/Kitchensink/index.json")
    ).json();
    expect(doc.title).toBe("The MDN Content Kitchensink");
    // There should be no flaws
    expect(Object.keys(doc.flaws).length).toBe(0);
  });

  // XXX Do more advanced tasks that test the server and document "CRUD operations"
});

// Note, some of these tests cover some of the core code that we use in
// the Lambda@Edge origin-request handler.
describe("Testing the Express server", () => {
  withDeveloping("redirect without any useful headers", async () => {
    let response = await got(serverURL("/"), { followRedirect: false });
    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe("/en-US/");

    response = await got(serverURL("/docs/Web"), {
      followRedirect: false,
    });
    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe("/en-US/docs/Web");

    // Trailing slashed
    response = await got(serverURL("/docs/Web/"), {
      followRedirect: false,
    });
    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe("/en-US/docs/Web");
  });

  withDeveloping("redirect based on _redirects.txt", async () => {
    // Yes, this is a bit delicate since it depends on non-fixtures, but
    // it's realistic and it's a good end-to-end test.
    // See mdn/content/files/en-us/_redirects.txt

    // First redirect *out* to an external URL.
    let response = await got(
      serverURL(
        "/en-US/docs/Mozilla/Add-ons/WebExtensions/Publishing_your_WebExtension"
      ),
      { followRedirect: false }
    );
    expect(response.statusCode).toBe(301);
    expect(response.headers.location).toBe(
      "https://extensionworkshop.com/documentation/publish/package-your-extension/"
    );

    // Redirect within.
    response = await got(
      serverURL(
        "/en-US/docs/Mozilla/Add-ons/WebExtensions/Extension_API_differences"
      ),
      { followRedirect: false }
    );
    expect(response.statusCode).toBe(301);
    expect(response.headers.location).toBe(
      "/en-US/docs/Mozilla/Add-ons/WebExtensions/Differences_between_API_implementations"
    );
  });

  withDeveloping("redirect by preferred locale cookie", async () => {
    let response = await got(serverURL("/"), {
      followRedirect: false,
      headers: {
        // Note! Case insensitive
        Cookie: "preferredlocale=zH-cN; foo=bar",
      },
    });
    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe("/zh-CN/");

    // Some bogus locale we definitely don't recognized
    response = await got(serverURL("/"), {
      followRedirect: false,
      headers: {
        Cookie: "preferredlocale=xyz; foo=bar",
      },
    });
    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe("/en-US/");
  });

  withDeveloping("redirect by 'Accept-Language' header", async () => {
    let response = await got(serverURL("/"), {
      followRedirect: false,
      headers: {
        // Based on https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Language
        "Accept-language": "fr-CH, fr;q=0.9, en;q=0.8, de;q=0.7, *;q=0.5",
      },
    });
    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe("/fr/");

    // Some bogus locale we definitely don't recognized
    response = await got(serverURL("/"), {
      followRedirect: false,
      headers: {
        "accept-language": "xyz, X;q=0.9, Y;q=0.8, Z;q=0.7, *;q=0.5",
      },
    });
    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe("/en-US/");
  });

  withDeveloping("redirect by cookie trumps", async () => {
    const response = await got(serverURL("/"), {
      followRedirect: false,
      headers: {
        Cookie: "preferredlocale=ja",
        "Accept-language": "fr-CH, fr;q=0.9, en;q=0.8, de;q=0.7, *;q=0.5",
      },
    });
    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe("/ja/");
  });
});

describe("Testing the CRUD apps", () => {
  withCrud("open the writer's home page", async () => {
    await page.goto(devURL("/"));
    await expect(page).toMatch("Writer's home page");
    await expect(page).toMatchElement("a", { text: "Flaws Dashboard" });
  });

  withCrud("open the Flaws Dashboard", async () => {
    await page.goto(devURL("/"));
    await expect(page).toClick("a", { text: "Flaws Dashboard" });
    await expect(page).toMatch("Documents with flaws found (0)");
  });

  withCrud("open the sitemap app", async () => {
    await page.goto(devURL("/"));
    await expect(page).toMatch("Writer's home page");
    await expect(page).toClick("a", { text: "Sitemap" });
    await expect(page).toMatchElement("a", { text: "Web" });
    await expect(page).toMatchElement("a", { text: "Learn" });
    await expect(page).toClick("a", { text: "Glossary" });
    await expect(page).toMatchElement("a", { text: "Glossary/PNG" });
  });
});
