const fs = require("fs");
const path = require("path");

const cheerio = require("cheerio");

const buildRoot = path.join("..", "client", "build");

test("content built foo page", () => {
  expect(fs.existsSync(buildRoot)).toBeTruthy();

  const builtFolder = path.join(buildRoot, "en-us", "docs", "web", "foo");
  expect(fs.existsSync(builtFolder)).toBeTruthy();

  const jsonFile = path.join(builtFolder, "index.json");
  expect(fs.existsSync(jsonFile)).toBeTruthy();

  // We should be able to read it and expect certain values
  const { doc } = JSON.parse(fs.readFileSync(jsonFile));
  expect(doc.title).toBe("<foo>: A test tag");
  expect(doc.summary).toBe("This is a sample page");
  expect(doc.mdn_url).toBe("/en-US/docs/Web/Foo");
  expect(doc.popularity).toBe(0.5);
  expect(doc.modified).toBeTruthy();
  expect(doc.modified).toBeTruthy();
  expect(doc.source).toBeTruthy();

  const brokenLinks = doc.flaws.broken_links;
  expect(brokenLinks).toBeTruthy();
  expect(brokenLinks.includes("/en-US/docs/Web/Fuu")).toBeTruthy();
  expect(brokenLinks.includes("/en-US/docs/Does/Not/Exist")).toBeTruthy();
  expect(brokenLinks.includes("//www.peterbe.com")).toBeFalsy();

  const htmlFile = path.join(builtFolder, "index.html");
  expect(fs.existsSync(htmlFile)).toBeTruthy();
  const html = fs.readFileSync(htmlFile, "utf-8");
  const $ = cheerio.load(html);
  expect($("p").text()).toMatch(/Below is a sample interactive example/);
  expect($("iframe").length).toEqual(1);
});

test("content built titles.json file", () => {
  const titlesFile = path.join(buildRoot, "en-us", "titles.json");
  expect(fs.existsSync(titlesFile)).toBeTruthy();
  const { titles } = JSON.parse(fs.readFileSync(titlesFile));
  expect(titles["/en-US/docs/Web/Foo"].title).toEqual("<foo>: A test tag");
  expect(titles["/en-US/docs/Web/Foo"].popularity).toEqual(0.5);

  // The archived content's documents should be in there
  expect(titles["/en-US/docs/XUL/ancientness"]).toBeFalsy();
});
