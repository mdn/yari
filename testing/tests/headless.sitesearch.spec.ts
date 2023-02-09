import { test, expect } from "@playwright/test";

export {};

function testURL(pathname = "/") {
  return "http://localhost:5042" + pathname;
}

test.describe("Site search", () => {
  const SEARCH_SELECTOR = 'form input[type="search"]';

  test("submit the autocomplete search form will redirect to site search", async ({
    page,
  }) => {
    await page.goto(testURL("/en-US/search/"));

    await page.fill(SEARCH_SELECTOR, "foo");
    await page.waitForSelector("#top-nav-search-form"); // autocomplete search form
    await page.$eval('form[role="search"]', (form) =>
      (form as HTMLFormElement).submit()
    );
    // Force a wait for the lazy-loading
    await page.waitForLoadState("networkidle");
    // Force a wait for the search results
    await page.waitForSelector("div.search-results");
    expect(await page.isVisible("text=Search results for:")).toBeTruthy();
    expect(page.url()).toBe(testURL("/en-US/search/?q=foo"));
  });

  test("go to site-search page without query", async ({ page }) => {
    await page.goto(testURL("/en-US/search/"));
    expect(await page.isVisible("text=No query, no results")).toBeTruthy();

    // See server/static.js for how fixtures are hardcoded
    await page.fill(SEARCH_SELECTOR, "FOO");
    await page.waitForSelector("#top-nav-search-form"); // autocomplete search form
    await page.$eval('form[role="search"]', (form) =>
      (form as HTMLFormElement).submit()
    );
    // Force a wait for the lazy-loading
    await page.waitForLoadState("networkidle");
    expect(page.url()).toBe(testURL("/en-US/search/?q=FOO"));
    expect(await page.isVisible("text=Search results for: FOO")).toBeTruthy();
    expect(await page.isVisible("text=Found 1 match")).toBeTruthy();
  });

  test("search and find nothing", async ({ page }) => {
    await page.goto(testURL("/en-US/search/"));
    expect(await page.isVisible("text=No query, no results")).toBeTruthy();

    // See server/static.js for how fixtures are hardcoded
    await page.fill(SEARCH_SELECTOR, "NOTHING");
    await page.waitForSelector("#top-nav-search-form"); // autocomplete search form
    await page.$eval('form[role="search"]', (form) =>
      (form as HTMLFormElement).submit()
    );
    await page.waitForLoadState("networkidle");
    expect(page.url()).toBe(testURL("/en-US/search/?q=NOTHING"));
    expect(
      await page.isVisible("text=Search results for: NOTHING")
    ).toBeTruthy();
    expect(await page.isVisible("text=Found 0 matches")).toBeTruthy();
  });

  test("search and go to page 2", async ({ page }) => {
    await page.goto(testURL("/en-US/search/"));

    // See server/static.js for how fixtures are hardcoded
    await page.fill(SEARCH_SELECTOR, "SERIAL(20)");
    await page.waitForSelector("#top-nav-search-form"); // autocomplete search form
    await page.$eval('form[role="search"]', (form) =>
      (form as HTMLFormElement).submit()
    );
    await page.waitForLoadState("networkidle");
    expect(
      await page.isVisible("text=Search results for: SERIAL(20)")
    ).toBeTruthy();
    expect(page.url()).toBe(testURL("/en-US/search/?q=SERIAL%2820%29"));
    expect(
      await page.isVisible("text=Found 20 matches in 0.1 milliseconds")
    ).toBeTruthy();
    expect(await page.isVisible("text=Serial 0")).toBeTruthy();
    expect(await page.isVisible("text=Serial 9")).toBeTruthy();
    expect(await page.isVisible('a:has-text("Next")')).toBeTruthy();
    expect(await page.isVisible("text=Serial 9")).toBeTruthy();
    expect(await page.isVisible('a:has-text("Previous")')).toBeFalsy();

    // Page 2.
    await page.click('a:has-text("Next")');
    await page.waitForLoadState("networkidle");

    expect(await page.isVisible("text=(page 2)")).toBeTruthy();
    expect(await page.isVisible("text=Serial 10")).toBeTruthy();
    expect(await page.isVisible("text=Serial 19")).toBeTruthy();
    expect(await page.isVisible('a:has-text("Previous")')).toBeTruthy();
    expect(await page.isVisible('a:has-text("Next")')).toBeFalsy();
    expect(page.url()).toBe(testURL("/en-US/search/?q=SERIAL%2820%29&page=2"));
  });
});
