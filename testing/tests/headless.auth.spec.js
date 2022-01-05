const { test, expect } = require("@playwright/test");

function testURL(pathname = "/") {
  return `http://localhost:5042${pathname}`;
}

test.describe("Visiting pages related and requiring authentication", () => {
  test.beforeEach(async ({ context }) => {
    // Necessary hack to make sure any existing 'sessionid' cookies don't
    // interfere on the re-used `page` across tests.
    await context.clearCookies();
  });

  test("clicking 'Sign in' should offer links to all identity providers", async ({
    page,
  }) => {
    await page.goto(testURL("/en-US/docs/Web/Foo"));
    await page.click("text=Sign in");
    expect(await page.innerText("h1")).toContain("Sign in");
    expect(page.url()).toContain(
      testURL(
        `/en-US/signin?${new URLSearchParams({
          next: "/en-US/docs/Web/Foo",
        }).toString()}`
      )
    );
    expect(
      await page.isVisible('a:has-text("Sign in with Firefox Accounts")')
    ).toBeTruthy();
  });

  test("show your settings page", async ({ page }) => {
    await page.goto(testURL("/en-US/settings"));
    expect(await page.innerText("h1")).toBe("Account settings");
    expect(await page.isVisible("text=You have not signed in")).toBeTruthy();
    expect(await page.isVisible("text=Sign in")).toBeTruthy();

    // First sign in with Fxa (happy path)
    await page.goto(testURL("/en-US/signin"));
    expect(
      await page.isVisible('a:has-text("Sign in with Firefox Accounts")')
    ).toBeTruthy();
    await page.click('a:has-text("Sign in with Firefox Accounts")');
    expect(page.url()).toMatch(testURL("/en-US/"));
    // This is important otherwise it won't wait for the XHR where the
    // cookie gets set!
    await page.waitForLoadState("networkidle");
    await page.goto(testURL("/en-US/settings"));
    expect(await page.innerText("h1")).toBe("Account settings");
    expect(
      await page.isVisible('button:has-text("Close account")')
    ).toBeTruthy();
    // Change locale to French
    await page.selectOption('select[name="locale"]', {
      label: "French",
    });
    await page.click('button:has-text("Update language")');
    await page.waitForLoadState("networkidle");
    expect(
      await page.isVisible("text=Updated settings successfully")
    ).toBeTruthy();
  });

  test("signing out", async ({ page }) => {
    // First sign in
    await page.goto(testURL("/en-US/signin"));
    await page.click('a:has-text("Sign in with Firefox Accounts")');
    expect(page.url()).toMatch(testURL("/en-US/"));
    // This is important otherwise it won't wait for the XHR where the
    // cookie gets set!
    await page.waitForLoadState("networkidle");

    await page.goto(testURL("/en-US/signout"));
    await page.waitForLoadState("networkidle");

    expect(await page.isVisible('button:has-text("Sign out")')).toBeTruthy();
    await page.click('button:has-text("Sign out")');

    await page.goto(testURL("/en-US/settings"));
    await page.waitForLoadState("networkidle");
    expect(await page.innerText("h1")).toBe("Account settings");
    expect(await page.isVisible("text=You have not signed in")).toBeTruthy();
    expect(await page.isVisible("text=Sign in")).toBeTruthy();
  });
});
