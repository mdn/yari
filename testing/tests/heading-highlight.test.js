/* eslint-disable no-undef */
const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");
const { uniqueH3ID } = require("../../build/heading-highlight");

const buildRoot = path.join("..", "client", "build");

// Main Tests - Heading Highlight to add permalinks
// issues here where, "error wile building documents" so I haven't been able to test thoroughly yet
test("content successfully built to test heading highlight utility", () => {
  expect(fs.existsSync(buildRoot)).toBeTruthy();

  // Creates '../client/build/en-us/docs/web/headinghighlight/' URI
  const builtFolder = path.join(
    buildRoot,
    "en-US",
    "docs",
    "web",
    "headinghighlight"
  );
  expect(fs.existsSync(builtFolder)).toBeTruthy(); // unexpected errors with jest here

  const jsonFile = path.join(builtFolder, "index.json");
  expect(fs.existsSync(jsonFile)).toBeTruthy();

  // should be able to read doc and keys from YAML inside document separators from index.html
  const { doc } = JSON.parse(fs.readFileSync(jsonFile));
  expect(doc.title).toBe(
    "Document with sub headings that need direct permalinks"
  );
  expect(doc.mdn_url).toBe("en-US/docs/Web/HeadingHighlight");
  expect(doc.summary).toBe(
    "A test page to check the headingHighlight utility."
  );

  // html content '/headinghighlight/index.html'
  const htmlFile = path.join(builtFolder, "index.html");
  const html = fs.readFileSync(htmlFile, "utf-8");

  // cheerio object
  const $ = cheerio.load(html);

  // test the .each loop
  $("h3").each((i, header) => {
    const $header = $(header);
    let textContent = $header.text();
    let fallbackID = uniqueH3ID($header.attr("id"));

    // maybe useless but should probably bail if no <h3> tags are present
    if (!$header) {
      console.warn(
        `Found ${i} <h3> tags on the document, unable to highlight page: ${doc.mdn_url}`
      );
      return; // bail
    }

    // if first character of an ID doesn't start
    // with [a-zA-Z] then inject an underscore
    const regExp = new RegExp(/^[^a-zA-Z]+/, "g");

    if (regExp.test(textContent)) {
      let id = uniqueH3ID(textContent);
      $header.attr("id", `_${id}`);
    } else if (regExp.test($header.attr("id"))) {
      let id = $header.attr("id");
      $header.attr("id", `_${id}`);
      expect($header.attr("id")).toBe(`_${id}`);
    }

    // if id exists use it for anchors href
    if ($header.attr("id")) {
      expect($header.attr("id")).toBeTruthy();
      let id = $header.attr("id").toLowerCase();

      let link = $(`<a href='#${id}'>${textContent}</a>`);
      // make sure links are set properly
      expect(link.attr("id")).toBe(`#${id}`);
      expect(link.text()).toBe($header.text());

      $header.attr("id", id);
      $header.prepend(link);
      $header.text("");
      expect(textContent).toBe("");
    } else {
      let id = uniqueH3ID(textContent);
      let link = $(`<a href='#${id}'>${textContent}</a>`);
      let duplicate = $(`h3:contains('${$header.text()}')`).eq(1);
      let j = 1;

      duplicate.attr("id", `${id}_${j + 1}`);
      $header.attr("id", `${id}`);
      $header.prepend(link);
      $header.text("");
    }
    return $header.prepend(`<a href='#${fallbackID}'>${textContent}</a>`);
  });
});

// Small Tests for Unique ID generator - (All passing)
test("test heading text with more than one word title cased", () => {
  expect(uniqueH3ID("Content Categories bla")).toBe("Content_Categories_bla");
});

// if some words have hyphen keep it, treat it as any other character
test("hyphenated heading", () => {
  expect(uniqueH3ID("Some-heading text")).toBe("Some-heading_text");
});

// when commas are in heading text remove them within the ID/permalink (manually set ID behavior)
// if we keep them it would look like this (Rest,_default,_and_destructured)
// I can update my regex to remove replace commas with white space but for now
// uniqueH3ID only matches white space characters and replaces them with an underscore
test("heading text with comma separated words", () => {
  expect(uniqueH3ID("Rest, default, and destructured parameters")).toBe(
    "Rest,_default,_and_destructured_parameters"
  );
});

// when heading text ends with a question mark,
// dont include it in ID (this is manually set ID behavior)
// my regex /\s+/ is only matching white space characters
test("heading text that ends with a ?", () => {
  expect(uniqueH3ID("What will your website look like?")).toBe(
    "What_will_your_website_look_like?"
  );
});

// I think manually set ID's have all non-word characters /\W+/ removed
test("heading text that ends with non-words", () => {
  expect(uniqueH3ID("Another one...")).toBe("Another_one...");
});
