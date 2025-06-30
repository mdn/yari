/* eslint-disable n/no-unsupported-features/node-builtins */
import { test, expect } from "@playwright/test";

export {};

const DEV_BASE_URL =
  process.env.DEVELOPING_DEV_BASE_URL || "http://localhost:3000";

function devURL(pathname = "/") {
  return `${DEV_BASE_URL}${pathname}`;
}

const SERVER_BASE_URL =
  process.env.DEVELOPING_SERVER_BASE_URL || "http://localhost:5042";

function serverURL(pathname = "/") {
  return `${SERVER_BASE_URL}${pathname}`;
}

function withCrud() {
  return (
    withDevelop() || JSON.parse(process.env.DEVELOPING_SKIP_DEV_URL || "false")
  );
}

function withDevelop() {
  return !JSON.parse(process.env.TESTING_DEVELOPING || "false");
}

test.describe("Testing the kitchensink page", () => {
  test("open the page", async ({ page }) => {
    test.skip(withCrud());

    await page.goto(devURL("/en-US/docs/MDN/Kitchensink"));
    await page.waitForLoadState("networkidle");
    await page.waitForSelector("text=The MDN Content Kitchensink");
    expect(await page.title()).toContain("The MDN Content Kitchensink");
    expect(
      await page.isVisible("text=The MDN Content Kitchensink")
    ).toBeTruthy();

    // Toolbar.
    await page.waitForSelector("#_flaws");
    // The kitchensink has 2 flaws right now...
    //expect(
    //  await page.isVisible("text=No known flaws at the moment")
    //).toBeTruthy();
  });

  test("open a file attachement directly in the dev URL", async ({ page }) => {
    test.skip(withCrud());

    await page.goto(devURL("/en-US/docs/MDN/Kitchensink/iceberg.jpg"));
    // This is how Chromium makes a document title when viewing an image.
    expect(await page.title()).toBe("iceberg.jpg (1400×1050)");
    // TODO: It would be nice to know what you opened is of correct type
    // or file size.
    expect(page.url()).toBe(devURL("/en-US/docs/MDN/Kitchensink/iceberg.jpg"));
  });

  test("server-side render HTML", async ({ page }) => {
    test.skip(withDevelop());

    // You can go to the page directly via the server
    await page.goto(serverURL("/en-US/docs/MDN/Kitchensink"));
    await page.waitForLoadState("networkidle");
    await page.waitForSelector("text=The MDN Content Kitchensink");
  });

  test("server-side render JSON", async () => {
    test.skip(withDevelop());

    // Loading the index.json doesn't require a headless browser
    // eslint-disable-next-line n/no-unsupported-features/node-builtins
    const response = await fetch(
      serverURL("/en-US/docs/MDN/Kitchensink/index.json")
    );
    const { doc } = await response.json();

    expect(doc.title).toBe("The MDN Content Kitchensink");
  });

  // XXX Do more advanced tasks that test the server and document "CRUD operations"
});

// Note, some of these tests cover some of the core code that we use in
// the Lambda@Edge origin-request handler.
test.describe("Testing the Express server", () => {
  test("redirect without any useful headers", async () => {
    test.skip(withDevelop());

    let response = await fetch(serverURL("/"), { redirect: "manual" });
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("/en-US/");

    response = await fetch(serverURL("/docs/Web"), { redirect: "manual" });
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("/en-US/docs/Web");

    // Trailing slashed
    response = await fetch(serverURL("/docs/Web/"), { redirect: "manual" });
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("/en-US/docs/Web");
  });

  test("redirect by preferred locale cookie", async () => {
    test.skip(withDevelop());

    let response = await fetch(serverURL("/"), {
      redirect: "manual",
      headers: {
        // Note! Case insensitive
        Cookie: "preferredlocale=zH-cN; foo=bar",
      },
    });
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("/zh-CN/");

    // Some bogus locale we definitely don't recognized
    response = await fetch(serverURL("/"), {
      redirect: "manual",
      headers: {
        Cookie: "preferredlocale=xyz; foo=bar",
      },
    });
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("/en-US/");
  });

  test("redirect by 'Accept-Language' header", async () => {
    test.skip(withDevelop());

    let response = await fetch(serverURL("/"), {
      redirect: "manual",
      headers: {
        // Based on https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Language
        "Accept-language": "fr-CH, fr;q=0.9, en;q=0.8, de;q=0.7, *;q=0.5",
      },
    });
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("/fr/");

    // Some bogus locale we definitely don't recognized
    response = await fetch(serverURL("/"), {
      redirect: "manual",
      headers: {
        "accept-language": "xyz, X;q=0.9, Y;q=0.8, Z;q=0.7, *;q=0.5",
      },
    });
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("/en-US/");
  });

  test("redirect by cookie trumps", async () => {
    test.skip(withDevelop());

    const response = await fetch(serverURL("/"), {
      redirect: "manual",
      headers: {
        Cookie: "preferredlocale=ja",
        "Accept-language": "fr-CH, fr;q=0.9, en;q=0.8, de;q=0.7, *;q=0.5",
      },
    });
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("/ja/");
  });
});

test.describe("Testing the CRUD apps", () => {
  test("open the writer's home page", async ({ page }) => {
    test.skip(withCrud());

    await page.goto(devURL("/"));
    await page.waitForSelector("#writers-homepage");

    expect(await page.title()).toContain("MDN Web Docs");

    expect(await page.isVisible("text=Writer's home page")).toBeTruthy();
    expect(await page.isVisible('a:has-text("Flaws Dashboard")')).toBeTruthy();
    expect(await page.isVisible('a:has-text("Sitemap")')).toBeTruthy();
  });

  test("open the sitemap app", async ({ page }) => {
    test.skip(withCrud());

    await page.goto(devURL("/"));
    await page.waitForSelector("#writers-homepage");

    expect(await page.isVisible("text=Writer's home page")).toBeTruthy();
    await page.click('a:has-text("Sitemap")');
    await page.waitForSelector('#sitemap:has-text("root")');

    expect(await page.isVisible('a:has-text("/Web")')).toBeTruthy();
    expect(await page.isVisible('a:has-text("/Learn")')).toBeTruthy();

    await page.click('a:has-text("/Glossary")');
    await page.waitForSelector('a:has-text("Glossary/PNG")');
    expect(await page.isVisible('a:has-text("Glossary/PNG")')).toBeTruthy();
  });
});
