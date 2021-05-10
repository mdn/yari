const { urlToFolderPath } = require("../content/utils");
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

const WINDOW_WIDTH = 1200;

test.each(urls)("%s", async (url) => {
  await page.setViewport({ width: WINDOW_WIDTH, height: 500 });
  await page.goto(`http://localhost:5000${url}`, { waitUntil: "networkidle2" });
  const { y, height } = await page.evaluate(() => {
    const contentRect = document
      .querySelector(".main-page-content")
      .getBoundingClientRect();
    return {
      y: contentRect.top,
      height: contentRect.height,
    };
  });
  const image = await page.screenshot({
    clip: { x: 0, y, width: WINDOW_WIDTH, height },
  });
  expect(image).toMatchImageSnapshot({
    customSnapshotIdentifier: urlToFolderPath(url)
      .split("/")
      .slice(1)
      .join("--"),
    comparisonMethod: "ssim",
    failureThreshold: 10,
    allowSizeMismatch: true,
  });
});
