const got = require("got");
require("expect-puppeteer");
const { setDefaultOptions } = require("expect-puppeteer");

// The default it 500ms. Building and running these pages can be pretty slow
// since the rendering both involves create-react-app bundling the test page,
// and then the server building of the page can be pretty heavy.
setDefaultOptions({ timeout: 1000 });

function devURL(pathname = "/") {
  return "http://localhost:3000" + pathname;
}

function serverURL(pathname = "/") {
  return "http://localhost:5000" + pathname;
}

// This "trick" is to force every test to be skipped if the environment
// variable hasn't been set. This way, when you run `jest ...`, and it finds
// all `**/*.test.js` it doesn't actually run these tests unless explicitly
// prepared to do so.
// The source of this idea comes from https://github.com/facebook/jest/issues/7245
const withDeveloping = JSON.parse(process.env.TESTING_DEVELOPING || "false")
  ? it
  : it.skip;

describe("Testing the kitchensink page", () => {
  withDeveloping("open the page", async () => {
    await page.goto(devURL("/en-US/docs/MDN/Kitchensink"));
    await expect(page).toMatch("The MDN Content Kitchensink");
    // If there are no flaws on that page or if there are, it will still
    // mention the word "flaws" somewhere in the Toolbar
    await expect(page).toMatchElement(".toolbar", { text: "flaws" });
  });

  withDeveloping("server-side render HTML", async () => {
    // You can go to the page directly via the server
    await page.goto(serverURL("/en-US/docs/MDN/Kitchensink"));
    await expect(page).toMatch("The MDN Content Kitchensink");
  });

  withDeveloping("server-side render HTML", async () => {
    // Loading the index.json doesn't require a headless browser
    const { doc } = await got(
      serverURL("/en-US/docs/MDN/Kitchensink/index.json")
    ).json();
    expect(doc.title).toBe("The MDN Content Kitchensink");
  });

  // XXX Do more advanced tasks that test the server and document "CRUD operations"
});
