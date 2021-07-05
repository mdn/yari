const { test, expect } = require("@playwright/test");

const testURL = (pathname = "/") => `http://localhost:5000${pathname}`;

test("open the /en-US/docs/Learn/CSS/CSS_layout/Introduction/Grid page", async ({
  page,
}) => {
  const uri = "/en-US/docs/Learn/CSS/CSS_layout/Introduction/Grid";
  const gridSample1Uri = `${uri}/_sample_.Grid_1.html`;
  const gridSample2Uri = `${uri}/_sample_.Grid_2.html`;
  await page.goto(testURL(uri));
  expect(await page.title()).toContain(
    "A Test Introduction to CSS Grid Layout"
  );
  expect(await page.innerText("h1")).toBe(
    "A Test Introduction to CSS Grid Layout"
  );
  expect(await page.innerText("#grid_layout")).toBe("Grid Layout");
  expect(
    (await page.innerText("#Grid_1 pre.css.notranslate")).match(
      /\.wrapper\s*\{\s*display:\s*grid;/
    )
  ).toBeTruthy();
  expect(
    await page.$(`iframe.sample-code-frame[src$="${gridSample1Uri}"]`)
  ).toBeTruthy();
  expect(
    (await page.innerText("#Grid_2 pre.css.notranslate")).match(/\.wrapper/)
  ).toBeTruthy();
  expect(
    await page.$(`iframe.sample-code-frame[src$="${gridSample2Uri}"]`)
  ).toBeTruthy();
  // Ensure that the live-sample page "gridSample2Uri" was built.
  await page.goto(testURL(gridSample2Uri));
  expect(await page.innerText("body > div.wrapper > div.box1")).toBe("One");
  expect(await page.innerText("body > div.wrapper > div.box2")).toBe("Two");
  expect(await page.innerText("body > div.wrapper > div.box3")).toBe("Three");
});
