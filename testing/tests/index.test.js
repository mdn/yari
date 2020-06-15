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
  expect(doc.source).toBeTruthy();

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

test("the 'notranslate' class is correctly inserted", () => {
  const folder = path.join(
    buildRoot,
    "en-us",
    "docs",
    "web",
    "donttranslatethese"
  );
  const htmlFile = path.join(folder, "index.html");
  const html = fs.readFileSync(htmlFile, "utf-8");
  const $ = cheerio.load(html);
  expect($("pre.notranslate").length).toEqual($("pre").length);
});

test("content with non-ascii characters in the slug", () => {
  const titlesFile = path.join(buildRoot, "en-us", "titles.json");
  expect(fs.existsSync(titlesFile)).toBeTruthy();
  const { titles } = JSON.parse(fs.readFileSync(titlesFile));
  expect(titles["/en-US/docs/Glossary/Bézier_curve"]).toBeTruthy();

  const builtFolder = path.join(
    buildRoot,
    "en-us",
    "docs",
    "glossary",
    "bézier_curve"
  );
  expect(fs.existsSync(builtFolder)).toBeTruthy();

  const jsonFile = path.join(builtFolder, "index.json");
  expect(fs.existsSync(jsonFile)).toBeTruthy();
  const { doc } = JSON.parse(fs.readFileSync(jsonFile));
  expect(doc.title).toBe("Bézier curve");
  expect(doc.mdn_url).toBe("/en-US/docs/Glossary/Bézier_curve");
});

test("content built bar page", () => {
  expect(fs.existsSync(buildRoot)).toBeTruthy();

  const builtFolder = path.join(buildRoot, "en-us", "docs", "web", "bar");
  expect(fs.existsSync(builtFolder)).toBeTruthy();

  const jsonFile = path.join(builtFolder, "index.json");
  expect(fs.existsSync(jsonFile)).toBeTruthy();

  // We should be able to read it and expect certain values
  const { doc } = JSON.parse(fs.readFileSync(jsonFile));
  expect(doc.title).toBe("bar: A collection of xref macro calls");
  expect(doc.summary).toBe("This is the Bar test page.");
  expect(doc.mdn_url).toBe("/en-US/docs/Web/Bar");
  expect(doc.popularity).toBe(0.51);
  expect(doc.modified).toBeTruthy();
  expect(doc.source).toBeTruthy();

  const htmlFile = path.join(builtFolder, "index.html");
  expect(fs.existsSync(htmlFile)).toBeTruthy();
  const html = fs.readFileSync(htmlFile, "utf-8");
  const $ = cheerio.load(html);
  const brokenLinks = $("a.new");
  expect(brokenLinks.length).toEqual(4);
  brokenLinks.each((index, element) => {
    if (index === 2) {
      expect($(element).text()).toBe("href");
    } else {
      expect($(element).text()).toBe("bigfoot");
    }
    expect($(element).attr("title")).toMatch(
      /The documentation about this has not yet been written/
    );
  });
  const numberLinks = $('a[href="/en-US/docs/Web/CSS/number"]');
  expect(numberLinks.length).toEqual(2);
  numberLinks.each((index, element) => {
    expect($(element).attr("title")).toBe("This is the number test page.");
  });
  expect(numberLinks.eq(0).text()).toBe("<dumber>");
  expect(numberLinks.eq(1).text()).toBe("<number>");
  const blobLinks = $('a[href="/en-US/docs/Web/API/Blob"]:not([title])');
  expect(blobLinks.length).toEqual(2);
  expect(blobLinks.eq(0).text()).toBe("Bob");
  expect(blobLinks.eq(1).text()).toBe("Blob");
  const hrefLinks = $(
    'a[href="/en-US/docs/Web/HTML/Element/a#attr-href"]:not([title])'
  );
  expect(hrefLinks.length).toEqual(2);
  hrefLinks.each((index, element) => {
    expect($(element).text()).toBe("href");
  });
  const strictModeLinks = $(
    'a[href="/en-US/docs/Web/JavaScript/Reference/Strict_mode"]:not([title])'
  );
  expect(strictModeLinks.length).toEqual(2);
  expect(strictModeLinks.eq(0).text()).toBe("Stern_mode");
  expect(strictModeLinks.eq(1).text()).toBe("Strict_mode");
  const booleanLinks = $(
    'a[href="/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean"]:not([title])'
  );
  expect(booleanLinks.length).toEqual(3);
  expect(booleanLinks.eq(0).text()).toBe("Flag");
  expect(booleanLinks.eq(1).text()).toBe("Boolean");
  expect(booleanLinks.eq(2).text()).toBe("bOOleAn");
});
