function testURL(pathname = "/") {
  return `http://localhost:5000${pathname}`;
}

describe("Visit the Plus home page and some of its deep-dive articles", () => {
  it("should serve Plus home page", async () => {
    await page.goto(testURL("/en-US/plus"));
    await expect(page).toMatch("MDN Plus");
    await expect(page).toMatch("More MDN. Your MDN.");
    await expect(page).toMatchElement("title", { text: /MDN Plus/ });
  });

  // NOTE! As of July 2021, the actual deep-dive articles are hardcoded
  // and not dynamically served. These tests knows exactly, and expects exactly,
  // the the know articles render.

  it("should serve sample article", async () => {
    await page.goto(
      testURL("/en-US/plus/deep-dives/Planning-for-browser-support")
    );
    await expect(page).toMatch("Planning for browser support");
    await expect(page).toMatchElement("title", {
      text: /Planning for browser support/,
    });
  });
});
