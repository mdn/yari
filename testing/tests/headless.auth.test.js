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

  //   test("going to 'Sign up' page without query string", async ({page}) => {
  //     await page.goto(testURL("/en-US/signup"));
  //     await expect(page).toMatchElement("h1", {
  //       text: "Sign in to MDN Web Docs",
  //     });
  //     await expect(page).toMatch("Invalid URL");
  //     await expect(page).toMatchElement("a", {
  //       text: "Please retry the sign-in process",
  //     });
  //   });
  //   test("going to 'Sign up' page with realistic (fake) query string", async ({page}) => {
  //     const sp = new URLSearchParams();
  //     sp.set("csrfmiddlewaretoken", "abc");
  //     sp.set("provider", "github");
  //     sp.set(
  //       "user_details",
  //       JSON.stringify({
  //         name: "Peter B",
  //       })
  //     );
  //     await page.goto(testURL(`/en-US/signup?${sp.toString()}`));
  //     await expect(page).toMatchElement("h1", {
  //       text: "Sign in to MDN Web Docs",
  //     });
  //     await expect(page).not.toMatch("Invalid URL");
  //     await expect(page).toMatch(
  //       "You are signing in to MDN Web Docs with GitHub as Peter B."
  //     );
  //     await expect(page).toMatch(
  //       "I agree to Mozilla's Terms and Privacy Notice."
  //     );
  //     await expect(page).toMatchElement("button", { text: "Complete sign-in" });
  //   });
  //   test("should show your settings page", async ({page}) => {
  //     const url = testURL("/en-US/settings");
  //     await page.goto(url);
  //     await expect(page).toMatchElement("h1", { text: "Account settings" });
  //     await expect(page).toMatch("You have not signed in");
  //     await expect(page).toMatch("Sign in");
  //     // First sign in with GitHub (happy path)
  //     await page.goto(testURL("/en-US/signin"));
  //     await expect(page).toMatch("Sign in with GitHub");
  //     await expect(page).toClick("a", {
  //       text: /Sign in with GitHub/,
  //     });
  //     await expect(page.url()).toMatch(testURL("/en-US/"));
  //     // This is important otherwise it won't wait for the XHR where the
  //     // cookie gets set!
  //     await page.waitForNavigation({ waitUntil: "networkidle2" });
  //     await page.goto(testURL("/en-US/settings"));
  //     await expect(page).toMatchElement("h1", { text: "Account settings" });
  //     await expect(page).toMatchElement("button", { text: "Close account" });
  //     // Change locale to French
  //     await expect(page).toSelect('select[name="locale"]', "French");
  //     await expect(page).toClick("button", { text: "Update language" });
  //     await expect(page).toMatch("Yay! Updated settings successfully saved.");
  //   });
  //   // This test has turned out to be fragile. It's failing sporadically and
  //   // we're not sure why or how. We've seen several times where the PR (on
  //   // something entirely unrelated) passes but when tested on the main branch
  //   // it then fails.
  //   // Example:
  //   // https://github.com/mdn/yari/actions/runs/1005504856
  //   // Clearly, there's something fragile about it.
  //   // But as of July 6 2021, there's an offline discussion that we might
  //   // revamp how auth works, so instead of trying to unbreak this fragile
  //   // test, let's comment it out. At least it'll unbreak our sporadically
  //   // failing CI but we can keep it around in case we really do need it
  //   // and find the time to work on fixing what's fragile about it.
  //   // test("should ask you to checkbox to sign up with Google", async ({page}) => {
  //   //   const url = testURL("/en-US/");
  //   //   await page.goto(url);
  //   //   // Wait for it to figure out that you're not signed in.
  //   //   await expect(page).toClick("a", { text: /Sign in/ });
  //   //   await page.waitForNavigation({ waitUntil: "networkidle2" });
  //   //   await expect(page.url()).toMatch(testURL("/en-US/signin"));
  //   //   await expect(page).toMatch("Sign in with Google");
  //   //   await expect(page).toClick("a", {
  //   //     text: /Sign in with Google/,
  //   //   });
  //   //   await expect(page.url()).toMatch(testURL("/en-US/signin"));
  //   //   await page.waitForNavigation({ waitUntil: "networkidle2" });
  //   //   const checkbox = await page.$('input[type="checkbox"]');
  //   //   await checkbox.click();
  //   //   await expect(page).toClick("button", {
  //   //     text: /Complete sign-in/,
  //   //   });
  //   //   await expect(page.url()).toMatch(testURL("/en-US/"));
  //   //   await expect(page).toMatch("Googler-username");
  //   // });
});
