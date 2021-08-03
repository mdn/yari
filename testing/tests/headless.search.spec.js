const { test, expect } = require("@playwright/test");

function testURL(pathname = "/") {
  return "http://localhost:5000" + pathname;
}

test.describe("Autocomplete search", () => {
  const SEARCH_SELECTOR = 'form input[type="search"]';

  test("find Foo page by title search", async ({ page }) => {
    // Yes, this is a cheeky implementation testing detail but it's a nice
    // sanity check that the server can respond with *something* that's
    // sensible. This "test" also helps make sense of other potentially
    // very confusing errors within the important tests themselves.
    await page.goto(testURL("/en-US/search-index.json"));
    // It's JSON but this asserts that page will be findable
    expect(await page.isVisible("text=<foo>: A test tag")).toBeTruthy();

    await page.goto(testURL("/"));
    await page.fill(SEARCH_SELECTOR, "foo");
    await page.waitForSelector("#nav-main-search"); // autocomplete search form
    expect(await page.isVisible("text=<foo>: A test tag")).toBeTruthy();
    // There's only 1 and this clicks on the first one anyway.
    await page.click("div.result-item");
    await page.waitForLoadState("networkidle");
    expect(await page.innerText("h1")).toBe("<foo>: A test tag");
    // Should have been redirected too...
    // Note! It's important that this happens *after* the `.toMatchElement`
    // on the line above because expect-puppeteer doesn't have a wait to
    // properly wait for the (pushState) URL to have changed.
    expect(page.url()).toBe(testURL("/en-US/docs/Web/Foo"));
  });

  test("find nothing by title search", async ({ page }) => {
    await page.goto(testURL("/"));
    await page.fill(SEARCH_SELECTOR, "gooblyg00k");
    expect(await page.innerText(".nothing-found")).toContain(
      "No document titles found"
    );
  });

  test("find Foo page by fuzzy-search", async ({ page }) => {
    await page.goto(testURL("/"));
    await page.fill(SEARCH_SELECTOR, "/");
    await page.waitForSelector("#nav-main-search"); // autocomplete search form
    expect(await page.isVisible("text=Fuzzy searching by URI")).toBeTruthy();
    expect(await page.isVisible("text=No document titles found")).toBeFalsy();
    await page.fill(SEARCH_SELECTOR, "/wboo");
    expect(await page.isVisible("text=<foo>: A test tag")).toBeTruthy();

    await page.click("div.result-item");
    await page.waitForLoadState("networkidle");
    expect(await page.innerText("h1")).toBe("<foo>: A test tag");
  });

  test("find nothing by fuzzy-search", async ({ page }) => {
    await page.goto(testURL("/"));
    await page.fill(SEARCH_SELECTOR, "/gooblygook");
    await page.waitForSelector("#nav-main-search"); // autocomplete search form
    expect(await page.isVisible("text=No document titles found")).toBeTruthy();
  });

  test("input placeholder changes when focused", async ({ page }) => {
    await page.goto(testURL("/"));
    expect(await page.getAttribute(SEARCH_SELECTOR, "placeholder")).toMatch(
      /Site search/
    );
    await page.focus(SEARCH_SELECTOR);
    expect(await page.getAttribute(SEARCH_SELECTOR, "placeholder")).toMatch(
      /Go ahead/
    );
  });
});
