const { toMatchImageSnapshot } = require("jest-image-snapshot");

const { FOLDERSEARCH } = require("../build/constants");
const { Document } = require("../content");

expect.extend({ toMatchImageSnapshot });

const urls = Array.from(
  Document.findAll({ folderSearch: FOLDERSEARCH }).iter()
).map((doc) => doc.url);

if (urls.length == 0) {
  console.error("No documents found for BUILD_FOLDERSEARCH = ", FOLDERSEARCH);
}

test.each(urls)("%s", async (url) => {
  await page.goto(`http://localhost:5000${url}`, { waitUntil: "networkidle2" });
  await page.setViewport({ width: 414, height: 717 });
  const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
  await page.setViewport({ width: 414, height: bodyHeight });
  const image = await page.screenshot({ fullPage: true });
  expect(image).toMatchImageSnapshot({
    comparisonMethod: "ssim",
    failureThreshold: 10,
    allowSizeMismatch: true,
  });
});
