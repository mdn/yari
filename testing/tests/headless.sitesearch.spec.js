function testURL(pathname = "/") {
  return "http://localhost:5000" + pathname;
}

describe("Site search", () => {
  const SEARCH_SELECTOR = 'form input[type="search"]';

  test("Submit the autocomplete search form will redirect to site search", async () => {
    await page.goto(testURL("/"));
    await expect(page).toFill(SEARCH_SELECTOR, "foo");
    await page.$eval('form[role="search"]', (form) => form.submit());
    // Force a wait for the lazy-loading
    await page.waitForNavigation({ waitUntil: "networkidle2" });
    expect(page.url()).toBe(testURL("/en-US/search/?q=foo"));
  });

  test("Go to site-search page without query", async () => {
    await page.goto(testURL("/en-us/search/"));
    await expect(page).toMatch("No query, no results");
    // See server/static.js for how fixtures are hardcoded
    await expect(page).toFill(SEARCH_SELECTOR, "FOO");
    await page.$eval('form[role="search"]', (form) => form.submit());
    // Force a wait for the lazy-loading
    await page.waitForNavigation({ waitUntil: "networkidle2" });
    await expect(page).toMatch("Search results for: FOO");
    await expect(page).toMatch("Found 1 match");
  });

  test("Search and find nothing", async () => {
    await page.goto(testURL("/en-us/search/"));
    await expect(page).toMatch("No query, no results");
    // See server/static.js for how fixtures are hardcoded
    await expect(page).toFill(SEARCH_SELECTOR, "NOTHING");
    await page.$eval('form[role="search"]', (form) => form.submit());
    await page.waitForNavigation({ waitUntil: "networkidle2" });
    await expect(page).toMatch("Search results for: NOTHING");
    await expect(page).toMatch("Found 0 matches");
  });

  test("Search and go to page 2", async () => {
    await page.goto(testURL("/en-US/search/"));
    // See server/static.js for how fixtures are hardcoded
    await expect(page).toFill(SEARCH_SELECTOR, "SERIAL(20)");
    await page.$eval('form[role="search"]', (form) => form.submit());
    await page.waitForNavigation({ waitUntil: "networkidle2" });
    await expect(page).toMatch("Search results for: SERIAL(20)");
    expect(page.url()).toBe(testURL("/en-US/search/?q=SERIAL%2820%29"));
    await expect(page).toMatch("Found 20 matches in 0.1 milliseconds");
    await expect(page).toMatch("Serial 0");
    await expect(page).toMatch("Serial 9");
    await expect(page).toMatchElement("a", { text: "Next" });
    await expect(page).not.toMatchElement("a", { text: "Previous" });
    await expect(page).toClick(".pagination a");
    await expect(page).toMatch("(page 2)");
    await expect(page).toMatch("Serial 10");
    await expect(page).toMatch("Serial 19");
    await expect(page).toMatchElement("a", { text: "Previous" });
    await expect(page).not.toMatchElement("a", { text: "Next" });
    expect(page.url()).toBe(testURL("/en-US/search?q=SERIAL%2820%29&page=2"));
  });
});
