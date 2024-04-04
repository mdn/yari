import { test, expect } from "@playwright/test";

export {};

function testURL(pathname = "/") {
  return "http://localhost:5042" + pathname;
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

    // This will activate the fancy autocomplete search and it should start
    // a download of the `/en-US/search-index.json` too.
    await page.focus(SEARCH_SELECTOR);
    await page.waitForSelector("#top-nav-search-form"); // autocomplete search form
    await page.waitForLoadState("networkidle");

    await page.fill(SEARCH_SELECTOR, "foo");
    expect(await page.isVisible("text=<foo>: A test tag")).toBeTruthy();
    // There's only 1 and this clicks on the first one anyway.
    await page.click("div.result-item");
    await page.waitForLoadState("networkidle");
    expect(await page.innerText("h1")).toBe("<foo>: A test tag");
    // Should have been redirected too...
    expect(page.url()).toBe(testURL("/en-US/docs/Web/Foo/"));
  });

  test("find nothing by title search", async ({ page }) => {
    await page.goto(testURL("/"));

    // This will activate the fancy autocomplete search and it should start
    // a download of the `/en-US/search-index.json` too.
    await page.focus(SEARCH_SELECTOR);
    await page.waitForSelector("#top-nav-search-form"); // autocomplete search form
    await page.waitForLoadState("networkidle");

    await page.fill(SEARCH_SELECTOR, "gooblyg00k");
    expect(await page.innerText(".nothing-found")).toContain(
      "No document titles found"
    );
  });
});
