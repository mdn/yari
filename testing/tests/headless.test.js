require("expect-puppeteer");

function testURL(pathname = "/") {
  return "http://localhost:5000" + pathname;
}

const TIMEOUT = 5000;
describe("Basic viewing of functional pages", () => {
  it("open the temporary home page", async () => {
    await page.goto(testURL("/"));
    await expect(page).toMatch("MDN Web Docs");
    await expect(page).toMatchElement("title", { text: /MDN Web Docs/ });
  });

  it("search and find Foo page", async () => {
    page.setDefaultTimeout(TIMEOUT);
    await page.goto(testURL("/"));
    await expect(page).toFill('form input[type="search"]', "fo");
    await expect(page).toMatch("<foo>: A test tag");
    await expect(page).toClick("div.highlit");
    // Should have been redirected too...
    expect(page.url()).toBe(testURL("/en-US/docs/Web/Foo"));
    await expect(page).toMatchElement("h1", { text: "<foo>: A test tag" });
  });

  it("open the /en-US/docs/Web/Foo page", async () => {
    await page.goto(testURL("/en-US/docs/Web/Foo"));
    await expect(page).toMatch("<foo>: A test tag");
  });
});
