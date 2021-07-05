const { startServer } = require("../../server/static");
const { test, expect } = require("@playwright/test");

const testURL = (pathname = "/") => `http://localhost:5000${pathname}`;

let server;
test.beforeAll(async () => {
  server = await startServer();
});
test.afterAll(() => {
  server.close();
});

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

// TODO: translate to playwright
// it("open the /en-US/docs/Learn/CSS/CSS_layout/Introduction page", async () => {
//   const uri = "/en-US/docs/Learn/CSS/CSS_layout/Introduction";
//   const flexSample1Uri = `${uri}/Flex/_sample_.Flex_1.html`;
//   const flexSample2Uri = `${uri}/Flex/_sample_.Flex_2.html`;
//   const gridSample1Uri = `${uri}/Grid/_sample_.Grid_1.html`;
//   const gridSample2Uri = `${uri}/_sample_.Grid_2.html`;
//   await page.goto(testURL(uri));
//   await expect(page).toMatch("A Test Introduction to CSS layout");
//   await expect(page).toMatchElement("h1", {
//     text: "A Test Introduction to CSS layout",
//   });
//   await expect(page).toMatchElement("#flexbox", {
//     text: "Flexbox",
//   });
//   await expect(page).toMatchElement(
//     `iframe.sample-code-frame[src$="${flexSample1Uri}"]`
//   );
//   await expect(page).toMatchElement(
//     `iframe.sample-code-frame[src$="${flexSample2Uri}"]`
//   );
//   await expect(page).toMatchElement("#grid_layout", {
//     text: "Grid Layout",
//   });
//   await expect(page).toMatchElement(
//     `iframe.sample-code-frame[src$="${gridSample1Uri}"]`
//   );
//   await expect(page).toMatchElement("#Grid_2 pre.css.notranslate", {
//     text: /\.wrapper\s*\{\s*display:\s*grid;/,
//   });
//   await expect(page).toMatchElement(
//     `iframe.sample-code-frame[src$="${gridSample2Uri}"]`
//   );
//   // Ensure that the live-sample pages were built.
//   for (const sampleUri of [
//     flexSample1Uri,
//     flexSample2Uri,
//     gridSample1Uri,
//     gridSample2Uri,
//   ]) {
//     await page.goto(testURL(sampleUri), { waitUntil: "networkidle0" });
//     await page.waitForTimeout(5000);
//     await expect(page).toMatchElement("body > div.wrapper > div.box1", {
//       text: "One",
//     });
//     await expect(page).toMatchElement("body > div.wrapper > div.box2", {
//       text: "Two",
//     });
//     await expect(page).toMatchElement("body > div.wrapper > div.box3", {
//       text: "Three",
//     });
//   }
// })
