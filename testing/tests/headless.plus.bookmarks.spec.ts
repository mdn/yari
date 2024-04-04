/*
import { test, expect } from "@playwright/test";

function testURL(pathname = "/") {
  const PORT = parseInt(process.env.SERVER_PORT || "5000");
  return `http://localhost:${PORT}${pathname}`;
}

test.describe("Bookmarking pages", () => {
  const SELECTOR = ".bookmark-button";

  test.beforeEach(async ({ context }) => {
    // Necessary hack to make sure any existing 'sessionid' cookies don't
    // interfere on the re-used `page` across tests.
    await context.clearCookies();
  });

  test("view a document without being a signed in subscriber", async ({
    page,
  }) => {
    await page.goto(testURL("/en-US/docs/Web/Foo"));
    expect(await page.isVisible(SELECTOR)).toBeFalsy();
  });

  test("view a document and being a signed in subscriber", async ({ page }) => {
    await page.goto(testURL("/en-US/docs/Web/Foo"));

    // Sign in
    await page.click("text='Log in'");
    await page.waitForLoadState("networkidle");

    await page.goto(testURL("/en-US/docs/Web/Foo"));
    await page.waitForSelector(SELECTOR);

    expect(await page.isVisible(SELECTOR)).toBeTruthy();

    await page.click(SELECTOR);
    await page.waitForLoadState("networkidle");

    expect(
      await page.isVisible('.bookmark-button-label:text-is("Save")')
    ).toBeFalsy();
    expect(
      await page.isVisible('.bookmark-button-label:text-is("Saved")')
    ).toBeTruthy();

    // Reload the page to prove that it sticks
    await page.goto(testURL("/en-US/docs/Web/Foo"));
    await page.waitForSelector(SELECTOR);

    expect(
      await page.isVisible('.bookmark-button-label:text-is("Saved")')
    ).toBeTruthy();
  });

  test("view your listing of all bookmarks", async ({ page }) => {
    await page.goto(testURL("/en-US/plus/collections"));
    await page.waitForLoadState("networkidle");
    await page.waitForSelector("text=You have not signed in");

    // Sign in
    await page.click("text='Log in'");
    await page.waitForLoadState("networkidle");

    await page.goto(testURL("/en-US/plus/collections"));
    await page.waitForSelector("text=Nothing saved yet.");

    // Open a bunch of pages
    const urls = [
      "/en-US/docs/Web/Foo",
      "/en-US/docs/Web/BrokenLinks",
      "/en-US/docs/Web/HTML/Element/a",
      "/en-US/docs/Web/CSS/number",
      "/en-US/docs/Web/Images",
      "/en-US/docs/Web/HTML_Headings",
    ];
    for (const url of urls) {
      await page.goto(testURL(url));
      await page.waitForSelector(SELECTOR);
      await page.click(SELECTOR);
    }

    const locator = page.locator(".pagination");

    await page.goto(testURL("/en-US/plus/collections"));
    await page.waitForSelector("h3:has-text('Collections')");

    await expect(locator).toBeVisible();

    // This picks one of the un-toggle buttons
    await page.click('button[title="Remove bookmark"]');
    await page.waitForLoadState("networkidle");

    await expect(locator).not.toBeVisible();
  });
});
*/
