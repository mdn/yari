import { test, expect } from "@playwright/test";

export {};

function testURL(pathname = "/") {
  const PORT = parseInt(process.env.SERVER_PORT || "5042");
  return `http://localhost:${PORT}${pathname}`;
}

test.describe("Visiting pages related and requiring authentication", () => {
  test.beforeEach(async ({ context }) => {
    // Necessary hack to make sure any existing 'sessionid' cookies don't
    // interfere on the re-used `page` across tests.
    await context.clearCookies();
  });

  test("'Log in' should link to fxa authentication flow and sign in", async ({
    page,
  }) => {
    await page.goto(testURL("/en-US/docs/Web/Foo"));

    const signinHref = await page.getAttribute("text='Log in'", "href");

    expect(signinHref).toContain(
      `/users/fxa/login/authenticate/?${new URLSearchParams({
        next: "/en-US/docs/Web/Foo",
      }).toString()}`
    );

    await page.click("text='Log in'");
    await page.waitForLoadState("networkidle");

    expect(page.url()).toBe(testURL("/en-US/docs/Web/Foo/"));
    await expect(page.locator(".user-menu")).toBeVisible();

    await page.click("#my-mdn-plus-button");
    await page.click(".signout-form button[type='submit']");
    await page.waitForLoadState("networkidle");

    expect(page.url()).toBe(testURL("/en-US/"));
  });

  test("Signing out", async ({ page }) => {
    await page.goto(testURL("/en-US/docs/Web/Foo"));

    // Sign in
    await page.click("text='Log in'");
    await page.waitForLoadState("networkidle");

    expect(page.url()).toBe(testURL("/en-US/docs/Web/Foo/"));
    await expect(page.locator(".user-menu")).toBeVisible();

    // open up user menu
    await page.click("#my-mdn-plus-button");
    // Sign out
    await page.click(".signout-form button[type='submit']");
    await page.waitForLoadState("networkidle");

    expect(page.url()).toBe(testURL("/en-US/"));
  });
});
