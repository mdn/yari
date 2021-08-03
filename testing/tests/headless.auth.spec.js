const { test, expect } = require("@playwright/test");

function testURL(pathname = "/") {
  return `http://localhost:5000${pathname}`;
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
    expect(await page.isVisible('a:has-text("GitHub")')).toBeTruthy();
    expect(await page.isVisible('a:has-text("Google")')).toBeTruthy();
  });

  test("going to 'Sign up' page without query string", async ({ page }) => {
    await page.goto(testURL("/en-US/signup"));

    expect(await page.innerText("h1")).toContain("Sign in to MDN Web Docs");
    expect(await page.isVisible("text=Invalid URL")).toBeTruthy();
    expect(
      await page.isVisible("text=Please retry the sign-in process")
    ).toBeTruthy();
  });

  test("going to 'Sign up' page with realistic (fake) query string", async ({
    page,
  }) => {
    const sp = new URLSearchParams();
    sp.set("csrfmiddlewaretoken", "abc");
    sp.set("provider", "github");
    sp.set(
      "user_details",
      JSON.stringify({
        name: "Peter B",
      })
    );
    await page.goto(testURL(`/en-US/signup?${sp.toString()}`));
    expect(await page.innerText("h1")).toContain("Sign in to MDN Web Docs");
    expect(await page.isVisible("text=Invalid URL")).toBeFalsy();
    expect(
      await page.isVisible(
        "text=You are signing in to MDN Web Docs with GitHub as Peter B."
      )
    ).toBeTruthy();
    expect(
      await page.isVisible(
        "text=I agree to Mozilla's Terms and Privacy Notice."
      )
    ).toBeTruthy();
    expect(
      await page.isVisible('button:has-text("Complete sign-in")')
    ).toBeTruthy();
    expect(
      await page.isVisible('button[disabled]:has-text("Complete sign-in")')
    ).toBeTruthy();
    await page.check('input[name="terms"]');
    expect(
      await page.isVisible('button[disabled]:has-text("Complete sign-in")')
    ).toBeFalsy();
    expect(
      await page.isVisible('button:has-text("Complete sign-in")')
    ).toBeTruthy();
    await page.click('button:has-text("Complete sign-in")');
  });

  test("should show your settings page", async ({ page }) => {
    await page.goto(testURL("/en-US/settings"));
    expect(await page.innerText("h1")).toBe("Account settings");
    expect(await page.isVisible("text=You have not signed in")).toBeTruthy();
    expect(await page.isVisible("text=Sign in")).toBeTruthy();

    // First sign in with GitHub (happy path)
    await page.goto(testURL("/en-US/signin"));
    expect(await page.isVisible('a:has-text("GitHub")')).toBeTruthy();
    await page.click('a:has-text("GitHub")');
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
  // This test has turned out to be fragile. It's failing sporadically and
  // we're not sure why or how. We've seen several times where the PR (on
  // something entirely unrelated) passes but when tested on the main branch
  // it then fails.
  // Example:
  // https://github.com/mdn/yari/actions/runs/1005504856
  // Clearly, there's something fragile about it.
  // But as of July 6 2021, there's an offline discussion that we might
  // revamp how auth works, so instead of trying to unbreak this fragile
  // test, let's comment it out. At least it'll unbreak our sporadically
  // failing CI but we can keep it around in case we really do need it
  // and find the time to work on fixing what's fragile about it.
  // test("should ask you to checkbox to sign up with Google", async ({page}) => {
  //   const url = testURL("/en-US/");
  //   await page.goto(url);
  //   // Wait for it to figure out that you're not signed in.
  //   await expect(page).toClick("a", { text: /Sign in/ });
  //   await page.waitForNavigation({ waitUntil: "networkidle2" });
  //   await expect(page.url()).toMatch(testURL("/en-US/signin"));
  //   await expect(page).toMatch("Sign in with Google");
  //   await expect(page).toClick("a", {
  //     text: /Sign in with Google/,
  //   });
  //   await expect(page.url()).toMatch(testURL("/en-US/signin"));
  //   await page.waitForNavigation({ waitUntil: "networkidle2" });
  //   const checkbox = await page.$('input[type="checkbox"]');
  //   await checkbox.click();
  //   await expect(page).toClick("button", {
  //     text: /Complete sign-in/,
  //   });
  //   await expect(page.url()).toMatch(testURL("/en-US/"));
  //   await expect(page).toMatch("Googler-username");
  // });
});
