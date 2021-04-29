const puppeteer = require("puppeteer");

const { toMatchImageSnapshot } = require("jest-image-snapshot");

const { FOLDERSEARCH } = require("../build/constants");
const { Document } = require("../content");

expect.extend({ toMatchImageSnapshot });

let browser;

beforeAll(async () => {
  browser = await puppeteer.launch();
});

const urls = Array.from(
  Document.findAll({ folderSearch: FOLDERSEARCH }).iter()
).map((doc) => doc.url);

if (urls.length == 0) {
  console.error("No documents found for BUILD_FOLDERSEARCH = ", FOLDERSEARCH);
}

test.each(urls)("%s", async (url) => {
  const page = await browser.newPage();
  await page.goto(`http://localhost:5000${url}`);
  const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
  await page.setViewport({ width: 1920, height: bodyHeight });
  const image = await page.screenshot({ fullPage: true });
  expect(image).toMatchImageSnapshot();
});
