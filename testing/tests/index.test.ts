import fs from "node:fs";
import path from "node:path";

import cheerio from "cheerio";
import imagesize from "image-size";

const { default: sizeOf } = imagesize;

import type {
  BCDSection,
  Doc,
  ProseSection,
  SpecificationsSection,
} from "../../libs/types/document.js";

const buildRoot = path.join("client", "build");

test("all favicons on the home page", () => {
  // The home page SPA is built, in terms of the index.html template,
  // the same as for all document pages.
  const htmlFile = path.join(buildRoot, "en-us", "index.html");
  const html = fs.readFileSync(htmlFile, "utf-8");
  const $ = cheerio.load(html);
  expect($('link[rel="icon"]')).toHaveLength(1);
  expect($('link[rel="apple-touch-icon"]')).toHaveLength(1);
  expect($('meta[property="og:image"]')).toHaveLength(1);

  // Check that every favicon works and resolves
  $('link[rel="icon"], link[rel="apple-touch-icon"]').each((i, element) => {
    const href = $(element).attr("href");
    // There should always be a 8 character hash in the href
    expect(/\.[a-f0-9]{8}\./.test(href)).toBeTruthy();
    // The favicon href is a URL so to check that it exists on disk we need to
    // strip the leading / and join that with the root of the build.
    const file = path.join(buildRoot, href.slice(1));
    expect(fs.existsSync(file)).toBeTruthy();

    if ($(element).attr("sizes")) {
      const [expectWidth, expectHeight] = $(element)
        .attr("sizes")
        .split("x")
        .map((v) => parseInt(v));
      const dimensions = sizeOf(file);
      expect(dimensions.width).toBe(expectWidth);
      expect(dimensions.height).toBe(expectHeight);
    }
  });

  // Check that the og:image resolves
  $('meta[property="og:image"]').each((i, element) => {
    const url = $(element).attr("content");
    const href = new URL(url).pathname;
    // There should always be a 8 character hash in the href
    expect(/\.[a-f0-9]{8}\./.test(href)).toBeTruthy();
    const file = path.join(buildRoot, href.slice(1));
    expect(fs.existsSync(file)).toBeTruthy();
  });
});

test("content built foo page", () => {
  expect(fs.existsSync(buildRoot)).toBeTruthy();

  const builtFolder = path.join(buildRoot, "en-us", "docs", "web", "foo");
  expect(fs.existsSync(builtFolder)).toBeTruthy();

  const jsonFile = path.join(builtFolder, "index.json");
  expect(fs.existsSync(jsonFile)).toBeTruthy();

  // We should be able to read it and expect certain values
  const { doc } = JSON.parse(fs.readFileSync(jsonFile, "utf-8")) as {
    doc: Doc;
  };
  expect(doc.title).toBe("<foo>: A test tag");
  expect(doc.pageTitle).toBe(`${doc.title} | MDN`);
  expect(doc.summary).toBe("This becomes the summary.");
  expect(doc.mdn_url).toBe("/en-US/docs/Web/Foo");
  expect(new Date(doc.modified)).toBeTruthy();
  expect(doc.source).toBeTruthy();

  expect(doc.flaws.macros).toHaveLength(1);
  expect(doc.flaws.macros[0]).toMatchObject({
    column: 4,
    errorStack: expect.stringContaining("pages is not iterable"),
    filepath: expect.stringContaining(
      "testing/content/files/en-us/web/foo/index.html"
    ),
    line: 8,
    macroName: "HTMLSidebar",
    name: "MacroExecutionError",
  });

  const htmlFile = path.join(builtFolder, "index.html");
  const html = fs.readFileSync(htmlFile, "utf-8");
  const $ = cheerio.load(html);

  expect($('meta[name="description"]').attr("content")).toBe(
    "This becomes the summary."
  );
  expect($('meta[property="og:description"]').attr("content")).toBe(
    "This becomes the summary."
  );

  // Before testing the `<img>` tags, assert that there's only 1 image in total.
  expect($("img")).toHaveLength(1);

  // The 'Foo' page has 1 image. It should have been given the `loading="lazy"`
  // attribute.
  expect($('img[loading="lazy"]')).toHaveLength(1);

  // The source didn't set the `width="..." height="..."` it gets set in build-time.
  // You need to be familiar with the 'screenshot.png' file in the fixtures to
  // what to expect here.
  expect($("img").attr("width")).toBe("250");
  expect($("img").attr("height")).toBe("250");

  // Every page, should have a `link[rel=canonical]` whose `href` always
  // starts with 'https://developer.mozilla.org' and ends with doc's URL.
  expect($("link[rel=canonical]").attr("href")).toBe(
    `https://developer.mozilla.org${doc.mdn_url}`
  );

  expect($('meta[name="robots"]').attr("content")).toBe("index, follow");

  // The HTML should contain the Google Analytics snippet.
  // The ID should match what's set in `.env.testing`.
  expect($('script[src="/static/js/ga.js"]')).toHaveLength(1);

  // Because this en-US page has a French translation
  expect($('link[rel="alternate"]')).toHaveLength(5);
  expect($('link[rel="alternate"][hreflang="en"]')).toHaveLength(2);
  expect($('link[rel="alternate"][hreflang="fr"]')).toHaveLength(1);
  expect($('link[rel="alternate"][hreflang="zh"]')).toHaveLength(1);
  expect($('link[rel="alternate"][hreflang="zh-Hant"]')).toHaveLength(1);
  const toEnUSURL = $('link[rel="alternate"][hreflang="en"]')
    .first()
    .attr("href");
  const toFrURL = $('link[rel="alternate"][hreflang="fr"]').attr("href");
  // The domain is hardcoded because the URL needs to be absolute and when
  // building static assets for Dev or Stage, you don't know what domain is
  // going to be used.
  expect(toEnUSURL).toBe("https://developer.mozilla.org/en-US/docs/Web/Foo");
  expect(toFrURL).toBe("https://developer.mozilla.org/fr/docs/Web/Foo");

  // The h4 heading in there has its ID transformed to lowercase
  expect($("main h4").attr("id")).toBe($("main h4").attr("id").toLowerCase());
});

test("icons mentioned in <head> should resolve", () => {
  const builtFolder = path.join(buildRoot, "en-us", "docs", "web", "foo");
  const htmlFile = path.join(builtFolder, "index.html");
  const html = fs.readFileSync(htmlFile, "utf-8");
  const $ = cheerio.load(html);
  $('head link[rel="apple-touch-icon-precomposed"]').each((i, link) => {
    const expectedFilepath = path.join(buildRoot, $(link).attr("href"));
    expect(fs.existsSync(expectedFilepath)).toBeTruthy();
  });
});

test("content built French foo page", () => {
  expect(fs.existsSync(buildRoot)).toBeTruthy();

  const builtFolder = path.join(buildRoot, "fr", "docs", "web", "foo");
  expect(fs.existsSync(builtFolder)).toBeTruthy();

  const jsonFile = path.join(builtFolder, "index.json");
  expect(fs.existsSync(jsonFile)).toBeTruthy();

  // We should be able to read it and expect certain values
  const { doc } = JSON.parse(fs.readFileSync(jsonFile, "utf-8")) as {
    doc: Doc;
  };
  expect(doc.title).toBe("<foo>: Une page de test");
  expect(doc.isTranslated).toBe(true);
  expect(doc.other_translations[0].locale).toBe("en-US");
  expect(doc.other_translations[0].native).toBe("English (US)");
  expect(doc.other_translations[0].title).toBe("<foo>: A test tag");

  const htmlFile = path.join(builtFolder, "index.html");
  const html = fs.readFileSync(htmlFile, "utf-8");
  const $ = cheerio.load(html);
  expect($('link[rel="alternate"]')).toHaveLength(5);
  expect($('link[rel="alternate"][hreflang="en"]')).toHaveLength(2);
  expect($('link[rel="alternate"][hreflang="fr"]')).toHaveLength(1);
  expect($('link[rel="alternate"][hreflang="zh"]')).toHaveLength(1);
  expect($('link[rel="alternate"][hreflang="zh-Hant"]')).toHaveLength(1);
  expect($('meta[property="og:locale"]').attr("content")).toBe("fr");
  expect($('meta[property="og:title"]').attr("content")).toBe(
    "<foo>: Une page de test | MDN"
  );
});

test("French translation using English front-matter bits", () => {
  const builtFolder = path.join(
    buildRoot,
    "fr",
    "docs",
    "web",
    "spec_section_extraction"
  );
  const jsonFile = path.join(builtFolder, "index.json");
  const { doc } = JSON.parse(fs.readFileSync(jsonFile, "utf-8")) as {
    doc: Doc;
  };
  expect(doc.title).toBe("Extraction de sections de spécifications");
  const specifications = doc.body.find(
    (section) => section.type === "specifications"
  ) as SpecificationsSection;
  expect(specifications.value.query).toBe(
    "javascript.builtins.Array.toLocaleString"
  );
  const bcd = doc.body.find(
    (section) => section.type === "browser_compatibility"
  ) as BCDSection;
  expect(bcd.value.query).toBe("javascript.builtins.Array.toLocaleString");
});

test("content built zh-CN page for hreflang tag testing", () => {
  const builtFolder = path.join(buildRoot, "zh-cn", "docs", "web", "foo");
  const jsonFile = path.join(builtFolder, "index.json");
  expect(fs.existsSync(jsonFile)).toBeTruthy();
  const { doc } = JSON.parse(fs.readFileSync(jsonFile, "utf-8")) as {
    doc: Doc;
  };
  expect(Object.keys(doc.flaws)).toHaveLength(1);
  expect(doc.flaws.translation_differences).toHaveLength(1);
  expect(doc.title).toBe("<foo>: 测试网页");
  expect(doc.isTranslated).toBe(true);
  expect(doc.other_translations[0].locale).toBe("en-US");
  expect(doc.other_translations[0].native).toBe("English (US)");
  expect(doc.other_translations[0].title).toBe("<foo>: A test tag");

  const htmlFile = path.join(builtFolder, "index.html");
  const html = fs.readFileSync(htmlFile, "utf-8");
  const $ = cheerio.load(html);
  // The built page should not have duplicate hreflang tags,
  // when zh-TW translation is also available.
  expect($('link[rel="alternate"]')).toHaveLength(5);
  expect($('link[rel="alternate"][hreflang="en"]')).toHaveLength(2);
  expect($('link[rel="alternate"][hreflang="fr"]')).toHaveLength(1);
  expect($('link[rel="alternate"][hreflang="zh"]')).toHaveLength(1);
  expect($('link[rel="alternate"][hreflang="zh-Hant"]')).toHaveLength(1);
  expect($('meta[property="og:locale"]').attr("content")).toBe("zh-CN");
  expect($('meta[property="og:title"]').attr("content")).toBe(
    "<foo>: 测试网页 | MDN"
  );
});

test("content built zh-TW page with en-US fallback image", () => {
  const builtFolder = path.join(buildRoot, "zh-tw", "docs", "web", "foo");
  const jsonFile = path.join(builtFolder, "index.json");
  expect(fs.existsSync(jsonFile)).toBeTruthy();
  const { doc } = JSON.parse(fs.readFileSync(jsonFile, "utf-8")) as {
    doc: Doc;
  };
  expect(Object.keys(doc.flaws)).toHaveLength(1);
  expect(doc.flaws.translation_differences).toHaveLength(1);
  expect(doc.title).toBe("<foo>: 測試網頁");
  expect(doc.isTranslated).toBe(true);
  expect(doc.other_translations[0].locale).toBe("en-US");
  expect(doc.other_translations[0].native).toBe("English (US)");
  expect(doc.other_translations[0].title).toBe("<foo>: A test tag");

  const htmlFile = path.join(builtFolder, "index.html");
  const html = fs.readFileSync(htmlFile, "utf-8");
  const $ = cheerio.load(html);
  expect($('link[rel="alternate"]')).toHaveLength(5);
  expect($('link[rel="alternate"][hreflang="en"]')).toHaveLength(2);
  expect($('link[rel="alternate"][hreflang="fr"]')).toHaveLength(1);
  expect($('link[rel="alternate"][hreflang="zh"]')).toHaveLength(1);
  expect($('link[rel="alternate"][hreflang="zh-Hant"]')).toHaveLength(1);
  expect($('meta[property="og:locale"]').attr("content")).toBe("zh-TW");
  expect($('meta[property="og:title"]').attr("content")).toBe(
    "<foo>: 測試網頁 | MDN"
  );
  expect($("#content img").attr("src")).toBe(
    "/en-US/docs/Web/Foo/screenshot.png"
  );
});

test("content built French Embeddable page", () => {
  const builtFolder = path.join(buildRoot, "fr", "docs", "web", "embeddable");
  const jsonFile = path.join(builtFolder, "index.json");
  const { doc } = JSON.parse(fs.readFileSync(jsonFile, "utf-8")) as {
    doc: Doc;
  };
  expect(doc.flaws.translation_differences).toHaveLength(1);
  const flaw = doc.flaws.translation_differences[0];
  expect(flaw.explanation).toBe(
    "Differences in the important macros (0 in common of 4 possible)"
  );
  expect(flaw.fixable).toBeFalsy();
  expect(flaw.suggestion).toBeFalsy();
  expect(flaw.difference.type).toBe("macro");
});

test("wrong xref macro errors", () => {
  const builtFolder = path.join(
    buildRoot,
    "en-us",
    "docs",
    "web",
    "wrong_xref_macro"
  );
  const jsonFile = path.join(builtFolder, "index.json");
  const { doc } = JSON.parse(fs.readFileSync(jsonFile, "utf-8")) as {
    doc: Doc;
  };
  // Expect the first flaw to be that we're using the wrong xref macro.
  expect(doc.flaws.macros[0].name).toBe("MacroBrokenLinkError");
  expect(doc.flaws.macros[0].macroSource).toBe('{{DOMxRef("Promise")}}');
  expect(doc.flaws.macros[0].line).toBe(7);
  expect(doc.flaws.macros[0].column).toBe(51);
  expect(doc.flaws.macros[0].sourceContext).toEqual(
    expect.stringContaining('Web API: {{DOMxRef("Promise")}}')
  );
});

test("summary extracted correctly by span class", () => {
  const builtFolder = path.join(
    buildRoot,
    "en-us",
    "docs",
    "web",
    "seo_summarized"
  );
  expect(fs.existsSync(builtFolder)).toBeTruthy();

  const jsonFile = path.join(builtFolder, "index.json");
  expect(fs.existsSync(jsonFile)).toBeTruthy();

  // We should be able to read it and expect certain values
  const { doc } = JSON.parse(fs.readFileSync(jsonFile, "utf-8")) as {
    doc: Doc;
  };
  expect(doc.summary).toBe("This is going to be the summary.");

  const htmlFile = path.join(builtFolder, "index.html");
  const html = fs.readFileSync(htmlFile, "utf-8");
  const $ = cheerio.load(html);

  expect($('meta[name="description"]').attr("content")).toBe(
    "This is going to be the summary."
  );
});

test("pageTitle on deeper docs within 'Web'", () => {
  const { doc: parentDoc } = JSON.parse(
    fs.readFileSync(
      path.join(buildRoot, "en-us", "docs", "web", "api", "index.json"),
      "utf-8"
    )
  );
  const { doc } = JSON.parse(
    fs.readFileSync(
      path.join(
        buildRoot,
        "en-us",
        "docs",
        "web",
        "api",
        "page_visibility_api",
        "index.json"
      ),
      "utf-8"
    )
  ) as { doc: Doc };
  expect(doc.pageTitle).toBe(`${doc.title} - ${parentDoc.title} | MDN`);
});

test("content built interactiveexample page", () => {
  expect(fs.existsSync(buildRoot)).toBeTruthy();

  const builtFolder = path.join(
    buildRoot,
    "en-us",
    "docs",
    "web",
    "interactiveexample"
  );
  expect(fs.existsSync(builtFolder)).toBeTruthy();

  const htmlFile = path.join(builtFolder, "index.html");
  const html = fs.readFileSync(htmlFile, "utf-8");
  const $ = cheerio.load(html);
  expect($("p").text()).toMatch(/Below is a sample interactive example/);
  expect($("iframe").length).toEqual(1);
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

test("the 'notecard' class is correctly inserted", () => {
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
  expect($("div.warning.notecard").length).toEqual($("div.warning").length);
});

test("content with non-ascii characters in the slug", () => {
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
  const { doc } = JSON.parse(fs.readFileSync(jsonFile, "utf-8")) as {
    doc: Doc;
  };
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
  const { doc } = JSON.parse(fs.readFileSync(jsonFile, "utf-8")) as {
    doc: Doc;
  };
  expect(doc.title).toBe("bar: A collection of xref macro calls");
  expect(doc.summary).toBe("Here is the summary of the document.");
  expect(doc.mdn_url).toBe("/en-US/docs/Web/Bar");
  // expect(doc.popularity).toBe(0.51);
  // expect(doc.modified).toBeTruthy();
  expect(doc.source).toBeTruthy();
  expect(doc.flaws.macros).toHaveLength(10);
  expect(doc.flaws.macros[0].name).toBe("MacroBrokenLinkError");
  expect(doc.flaws.macros[0].macroSource).toBe('{{CSSxRef("bigfoot")}}');
  expect(doc.flaws.macros[0].line).toBe(9);
  expect(doc.flaws.macros[0].column).toBe(6);
  expect(doc.flaws.macros[1].name).toBe("MacroRedirectedLinkError");
  expect(doc.flaws.macros[1].macroSource).toBe('{{CSSxRef("dumber")}}');
  expect(doc.flaws.macros[1].line).toBe(10);
  expect(doc.flaws.macros[1].column).toBe(6);
  expect(doc.flaws.macros[1].redirectInfo).toBeDefined();
  expect(doc.flaws.macros[1].redirectInfo.current).toBe("dumber");
  expect(doc.flaws.macros[1].redirectInfo.suggested).toBe("number");
  expect(doc.flaws.macros[2].name).toBe("MacroBrokenLinkError");
  expect(doc.flaws.macros[2].macroSource).toBe('{{DOMxRef("bigfoot")}}');
  expect(doc.flaws.macros[2].line).toBe(12);
  expect(doc.flaws.macros[2].column).toBe(6);
  expect(doc.flaws.macros[3].name).toBe("MacroRedirectedLinkError");
  expect(doc.flaws.macros[3].macroSource).toBe('{{DOMxRef("Bob")}}');
  expect(doc.flaws.macros[3].line).toBe(13);
  expect(doc.flaws.macros[3].column).toBe(6);
  expect(doc.flaws.macros[3].redirectInfo).toBeDefined();
  expect(doc.flaws.macros[3].redirectInfo.current).toBe("Bob");
  expect(doc.flaws.macros[3].redirectInfo.suggested).toBe("Blob");
  expect(doc.flaws.macros[4].name).toBe("MacroBrokenLinkError");
  expect(doc.flaws.macros[4].macroSource).toBe('{{jsxref("bigfoot")}}');
  expect(doc.flaws.macros[4].line).toBe(15);
  expect(doc.flaws.macros[4].column).toBe(6);
  expect(doc.flaws.macros[5].name).toBe("MacroRedirectedLinkError");
  expect(doc.flaws.macros[5].macroSource).toBe('{{jsxref("Stern_mode")}}');
  expect(doc.flaws.macros[5].line).toBe(16);
  expect(doc.flaws.macros[5].column).toBe(6);
  expect(doc.flaws.macros[5].redirectInfo).toBeDefined();
  expect(doc.flaws.macros[5].redirectInfo.current).toBe("Stern_mode");
  expect(doc.flaws.macros[5].redirectInfo.suggested).toBe("Strict_mode");
  expect(doc.flaws.macros[6].name).toBe("MacroRedirectedLinkError");
  expect(doc.flaws.macros[6].macroSource).toBe('{{jsxref("Flag")}}');
  expect(doc.flaws.macros[6].line).toBe(18);
  expect(doc.flaws.macros[6].column).toBe(6);
  expect(doc.flaws.macros[6].redirectInfo).toBeDefined();
  expect(doc.flaws.macros[6].redirectInfo.current).toBe("Flag");
  expect(doc.flaws.macros[6].redirectInfo.suggested).toBe("Boolean");
  expect(doc.flaws.macros[7].name).toBe("MacroRedirectedLinkError");
  expect(doc.flaws.macros[7].macroSource).toBe("{{ jsxref('Flag') }}");
  expect(doc.flaws.macros[7].line).toBe(19);
  expect(doc.flaws.macros[7].column).toBe(6);
  expect(doc.flaws.macros[7].redirectInfo).toBeDefined();
  expect(doc.flaws.macros[7].redirectInfo.current).toBe("Flag");
  expect(doc.flaws.macros[7].redirectInfo.suggested).toBe("Boolean");
  expect(doc.flaws.macros[8].name).toBe("MacroRedirectedLinkError");
  expect(doc.flaws.macros[8].macroSource).toBe('{{JSXref("Flag")}}');
  expect(doc.flaws.macros[8].line).toBe(20);
  expect(doc.flaws.macros[8].column).toBe(6);
  expect(doc.flaws.macros[8].redirectInfo).toBeDefined();
  expect(doc.flaws.macros[8].redirectInfo.current).toBe("Flag");
  expect(doc.flaws.macros[8].redirectInfo.suggested).toBe("Boolean");
  expect(doc.flaws.macros[9].name).toBe("MacroRedirectedLinkError");
  expect(doc.flaws.macros[9].macroSource).toBe('{{JSXref("Flag")}}');
  expect(doc.flaws.macros[9].line).toBe(21);
  expect(doc.flaws.macros[9].column).toBe(6);
  expect(doc.flaws.macros[9].redirectInfo).toBeDefined();
  expect(doc.flaws.macros[9].redirectInfo.current).toBe("Flag");
  expect(doc.flaws.macros[9].redirectInfo.suggested).toBe("Boolean");

  const htmlFile = path.join(builtFolder, "index.html");
  expect(fs.existsSync(htmlFile)).toBeTruthy();
  const html = fs.readFileSync(htmlFile, "utf-8");
  const $ = cheerio.load(html);
  expect($("a[data-flaw-src]").length).toEqual(10);

  const brokenLinks = $("a.page-not-created");
  expect(brokenLinks.length).toEqual(3);
  expect(brokenLinks.eq(0).data("flaw-src")).toBe('{{CSSxRef("bigfoot")}}');
  expect(brokenLinks.eq(0).text()).toBe("bigfoot");
  expect(brokenLinks.eq(1).data("flaw-src")).toBe('{{DOMxRef("bigfoot")}}');
  expect(brokenLinks.eq(1).text()).toBe("bigfoot");
  expect(brokenLinks.eq(2).data("flaw-src")).toBe('{{jsxref("bigfoot")}}');
  expect(brokenLinks.eq(2).text()).toBe("bigfoot");
  brokenLinks.each((index, element) => {
    expect($(element).attr("title")).toMatch(
      /The documentation about this has not yet been written/
    );
  });

  const numberLinks = $('a[href="/en-US/docs/Web/CSS/number"]');
  expect(numberLinks.length).toEqual(2);
  expect(numberLinks.eq(0).text()).toBe("<dumber>");
  expect(numberLinks.eq(0).data("flaw-src")).toBe('{{CSSxRef("dumber")}}');
  expect(numberLinks.eq(1).text()).toBe("<number>");
  expect(numberLinks.eq(1).data("flaw-src")).toBeFalsy();

  const blobLinks = $('a[href="/en-US/docs/Web/API/Blob"]:not([title])');
  expect(blobLinks.length).toEqual(2);
  expect(blobLinks.eq(0).text()).toBe("Bob");
  expect(blobLinks.eq(0).data("flaw-src")).toBe('{{DOMxRef("Bob")}}');
  expect(blobLinks.eq(1).text()).toBe("Blob");
  expect(blobLinks.eq(1).data("flaw-src")).toBeFalsy();

  const strictModeLinks = $(
    'a[href="/en-US/docs/Web/JavaScript/Reference/Strict_mode"]:not([title])'
  );
  expect(strictModeLinks.length).toEqual(2);
  expect(strictModeLinks.eq(0).text()).toBe("Stern_mode");
  expect(strictModeLinks.eq(0).data("flaw-src")).toBe(
    '{{jsxref("Stern_mode")}}'
  );
  expect(strictModeLinks.eq(1).text()).toBe("Strict_mode");
  expect(strictModeLinks.eq(1).data("flaw-src")).toBeFalsy();

  const booleanLinks = $(
    'a[href="/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean"]:not([title])'
  );
  expect(booleanLinks.length).toEqual(6);
  expect(booleanLinks.eq(0).text()).toBe("Flag");
  expect(booleanLinks.eq(0).data("flaw-src")).toBe('{{jsxref("Flag")}}');
  expect(booleanLinks.eq(1).text()).toBe("Flag");
  expect(booleanLinks.eq(1).data("flaw-src")).toBe("{{ jsxref('Flag') }}");
  expect(booleanLinks.eq(2).text()).toBe("Flag");
  expect(booleanLinks.eq(2).data("flaw-src")).toBe('{{JSXref("Flag")}}');
  expect(booleanLinks.eq(3).text()).toBe("Flag");
  expect(booleanLinks.eq(3).data("flaw-src")).toBe('{{JSXref("Flag")}}');
  expect(booleanLinks.eq(4).text()).toBe("Boolean");
  expect(booleanLinks.eq(4).data("flaw-src")).toBeFalsy();
  expect(booleanLinks.eq(5).text()).toBe("bOOleAn");
  expect(booleanLinks.eq(5).data("flaw-src")).toBeFalsy();
});

test("broken links flaws", () => {
  const builtFolder = path.join(
    buildRoot,
    "en-us",
    "docs",
    "web",
    "brokenlinks"
  );
  const jsonFile = path.join(builtFolder, "index.json");
  const { doc } = JSON.parse(fs.readFileSync(jsonFile, "utf-8")) as {
    doc: Doc;
  };
  const { flaws } = doc;
  // You have to be intimately familiar with the fixture to understand
  // why these flaws come out as they do.
  expect(flaws.broken_links).toHaveLength(12);
  // Map them by 'href'
  const map = new Map(flaws.broken_links.map((x) => [x.href, x]));
  expect(map.get("/en-US/docs/Hopeless/Case").suggestion).toBeNull();
  expect(map.get("/en-US/docs/Web/CSS/dumber").line).toBe(10);
  expect(map.get("/en-US/docs/Web/CSS/dumber").column).toBe(13);
  expect(
    map.get("https://developer.mozilla.org/en-US/docs/Web/API/Blob").suggestion
  ).toBe("/en-US/docs/Web/API/Blob");
  expect(
    map.get("https://developer.mozilla.org/en-US/docs/Web/API/Blob#Anchor")
      .suggestion
  ).toBe("/en-US/docs/Web/API/Blob#Anchor");
  expect(
    map.get("https://developer.mozilla.org/en-US/docs/Web/API/Blob?a=b")
      .suggestion
  ).toBe("/en-US/docs/Web/API/Blob?a=b");
  expect(map.get("/en-us/DOCS/Web/api/BLOB").suggestion).toBe(
    "/en-US/docs/Web/API/Blob"
  );
  expect(
    map.get("/en-US/docs/Web/HTML/Element/anchor#fragment").suggestion
  ).toBe("/en-US/docs/Web/HTML/Element/a#fragment");
  expect(
    map.get("/en-US/docs/glossary/bézier_curve#identifier").suggestion
  ).toBe("/en-US/docs/Glossary/Bézier_curve#identifier");
  expect(map.get("/en-US/docs/Web/BrokenLinks").explanation).toBe(
    "Link points to the page it's already on"
  );
  expect(map.get("/en-US/docs/Web/BrokenLinks#anchor").explanation).toBe(
    "No need for the pathname in anchor links if it's the same page"
  );
  expect(map.get("/en-US/docs/Web/BrokenLinks#anchor").suggestion).toBe(
    "#anchor"
  );
  expect(map.get("http://www.mozilla.org").explanation).toBe(
    "Is currently http:// but can become https://"
  );
  expect(map.get("http://www.mozilla.org").suggestion).toBe(
    "https://www.mozilla.org"
  );
  expect(map.get("http://www.mozilla.org").fixable).toBeTruthy();
});

test("broken links markdown flaws", () => {
  const builtFolder = path.join(
    buildRoot,
    "en-us",
    "docs",
    "web",
    "brokenlinks_markdown"
  );
  const jsonFile = path.join(builtFolder, "index.json");
  const { doc } = JSON.parse(fs.readFileSync(jsonFile, "utf-8")) as {
    doc: Doc;
  };
  const { flaws } = doc;
  // You have to be intimately familiar with the fixture to understand
  // why these flaws come out as they do.
  expect(flaws.broken_links).toHaveLength(12);
  // Map them by 'href'
  const map = new Map(flaws.broken_links.map((x) => [x.href, x]));
  expect(map.get("/en-US/docs/Hopeless/Case").suggestion).toBeNull();
  expect(map.get("/en-US/docs/Web/CSS/dumber").line).toBe(9);
  expect(map.get("/en-US/docs/Web/CSS/dumber").column).toBe(1);
  expect(
    map.get("https://developer.mozilla.org/en-US/docs/Web/API/Blob").suggestion
  ).toBe("/en-US/docs/Web/API/Blob");
  expect(
    map.get("https://developer.mozilla.org/en-US/docs/Web/API/Blob#Anchor")
      .suggestion
  ).toBe("/en-US/docs/Web/API/Blob#Anchor");
  expect(
    map.get("https://developer.mozilla.org/en-US/docs/Web/API/Blob?a=b")
      .suggestion
  ).toBe("/en-US/docs/Web/API/Blob?a=b");
  expect(map.get("/en-us/DOCS/Web/api/BLOB").suggestion).toBe(
    "/en-US/docs/Web/API/Blob"
  );
  expect(
    map.get("/en-US/docs/Web/HTML/Element/anchor#fragment").suggestion
  ).toBe("/en-US/docs/Web/HTML/Element/a#fragment");
  expect(
    map.get("/en-US/docs/glossary/bézier_curve#identifier").suggestion
  ).toBe("/en-US/docs/Glossary/Bézier_curve#identifier");
  expect(map.get("/en-US/docs/Web/BrokenLinks_Markdown").explanation).toBe(
    "Link points to the page it's already on"
  );
  expect(
    map.get("/en-US/docs/Web/BrokenLinks_Markdown#anchor").explanation
  ).toBe("No need for the pathname in anchor links if it's the same page");
  expect(
    map.get("/en-US/docs/Web/BrokenLinks_Markdown#anchor").suggestion
  ).toBe("#anchor");
  expect(map.get("http://www.mozilla.org").explanation).toBe(
    "Is currently http:// but can become https://"
  );
  expect(map.get("http://www.mozilla.org").suggestion).toBe(
    "https://www.mozilla.org"
  );
  expect(map.get("http://www.mozilla.org").fixable).toBeTruthy();
});

test("repeated broken links flaws", () => {
  // This fixture has the same broken link, that redirects, 3 times.
  const builtFolder = path.join(
    buildRoot,
    "en-us",
    "docs",
    "web",
    "brokenlinks_repeats"
  );
  const jsonFile = path.join(builtFolder, "index.json");
  const { doc } = JSON.parse(fs.readFileSync(jsonFile, "utf-8")) as {
    doc: Doc;
  };
  const { flaws } = doc;
  // You have to be intimately familiar with the fixture to understand
  // why these flaws come out as they do.
  expect(flaws.broken_links).toHaveLength(3);

  // Map them by 'id'
  const map = new Map(flaws.broken_links.map((x) => [x.id, x]));
  expect(map.size).toBe(3);
  expect(map.get("link1").suggestion).toBe("/en-US/docs/Web/CSS/number");
  expect(map.get("link2").suggestion).toBe("/en-US/docs/Web/CSS/number");
  expect(map.get("link3").suggestion).toBe("/en-US/docs/Web/CSS/number");
});

test("broken http:// link that is not a valid URL", () => {
  const builtFolder = path.join(
    buildRoot,
    "en-us",
    "docs",
    "web",
    "brokenlinks",
    "broken_http_link"
  );
  const jsonFile = path.join(builtFolder, "index.json");
  const { doc } = JSON.parse(fs.readFileSync(jsonFile, "utf-8")) as {
    doc: Doc;
  };
  const { flaws } = doc;
  expect(flaws.broken_links).toHaveLength(1);

  const map = new Map(flaws.broken_links.map((x) => [x.id, x]));
  expect(map.size).toBe(1);
  expect(map.get("link1").suggestion).toBeNull();
  expect(map.get("link1").explanation).toBe("Not a valid link URL");
  expect(map.get("link1").fixable).toBeFalsy();
});

test("broken links that are links to the current page", () => {
  const builtFolder = path.join(
    buildRoot,
    "en-us",
    "docs",
    "web",
    "brokenlinks",
    "self_links"
  );
  const jsonFile = path.join(builtFolder, "index.json");
  const { doc } = JSON.parse(fs.readFileSync(jsonFile, "utf-8")) as {
    doc: Doc;
  };
  const { flaws } = doc;
  expect(flaws.broken_links).toHaveLength(4);

  const map = new Map(flaws.broken_links.map((x) => [x.id, x]));
  expect(map.size).toBe(4);
  expect(map.get("link1").suggestion).toBeNull();
  expect(map.get("link1").explanation).toBe(
    "Link points to the page it's already on"
  );
  expect(map.get("link2").suggestion).toBe("#anchored");
  expect(map.get("link2").explanation).toBe(
    "No need for the pathname in anchor links if it's the same page"
  );
  expect(map.get("link3").suggestion).toBeNull();
  expect(map.get("link3").explanation).toBe(
    "Link points to the page it's already on"
  );
  expect(map.get("link4").suggestion).toBe("#hash");
  expect(map.get("link4").explanation).toBe(
    "No need for the pathname in anchor links if it's the same page"
  );

  const htmlFile = path.join(builtFolder, "index.html");
  const html = fs.readFileSync(htmlFile, "utf-8");
  const $ = cheerio.load(html);

  expect($("#content a.page-not-created")).toHaveLength(0);
  expect($('#content a[aria-current="page"]')).toHaveLength(4);
});

test("without locale prefix broken links flaws", () => {
  // This fixture has the same broken link, that redirects, 3 times.
  const builtFolder = path.join(
    buildRoot,
    "en-us",
    "docs",
    "web",
    "brokenlinks",
    "without_locale_prefix"
  );
  const jsonFile = path.join(builtFolder, "index.json");
  const { doc } = JSON.parse(fs.readFileSync(jsonFile, "utf-8")) as {
    doc: Doc;
  };
  const { flaws } = doc;
  // You have to be intimately familiar with the fixture to understand
  // why these flaws come out as they do.
  expect(flaws.broken_links).toHaveLength(3);

  // Map them by 'id'
  const map = new Map(flaws.broken_links.map((x) => [x.id, x]));
  expect(map.size).toBe(3);
  expect(map.get("link1").suggestion).toBe("/en-US/docs/Web/CSS/number");
  expect(map.get("link2").suggestion).toBe("/en-US/docs/Web/CSS/number");
  expect(map.get("link3").suggestion).toBeNull();
});

test("broken anchor links flaws", () => {
  const builtFolder = path.join(
    buildRoot,
    "en-us",
    "docs",
    "web",
    "not_lowercase_anchors"
  );
  const jsonFile = path.join(builtFolder, "index.json");
  const { doc } = JSON.parse(fs.readFileSync(jsonFile, "utf-8")) as {
    doc: Doc;
  };
  const { flaws } = doc;
  // You have to be intimately familiar with the fixture to understand
  // why these flaws come out as they do.
  expect(flaws.broken_links).toHaveLength(3);
  // Map them by 'href'
  const map = new Map(flaws.broken_links.map((x) => [x.href, x]));
  expect(map.get("#Heading1").suggestion).toBe("#heading1");
  expect(map.get("#Heading1").explanation).toBe("Anchor not lowercase");
  expect(map.get("#Heading1").fixable).toBe(true);
  expect(map.get("#Heading1").line).toBe(7);
  expect(map.get("#Heading1").column).toBe(16);

  expect(map.get("/en-US/docs/Web/Foo#Heading2").suggestion).toBe(
    "/en-US/docs/Web/Foo#heading2"
  );
  expect(map.get("/en-US/docs/Web/Foo#Heading2").explanation).toBe(
    "Anchor not lowercase"
  );
  expect(map.get("/en-US/docs/Web/Foo#Heading2").fixable).toBe(true);
  expect(map.get("/en-US/docs/Web/Foo#Heading2").line).toBe(8);
  expect(map.get("/en-US/docs/Web/Foo#Heading2").column).toBe(16);

  expect(map.get("/en-US/docs/Web/Fuu#Anchor").suggestion).toBe(
    "/en-US/docs/Web/Foo#anchor"
  );
  expect(map.get("/en-US/docs/Web/Fuu#Anchor").explanation).toBe(
    "Can't resolve /en-US/docs/Web/Fuu#Anchor"
  );
  expect(map.get("/en-US/docs/Web/Fuu#Anchor").fixable).toBe(true);
  expect(map.get("/en-US/docs/Web/Fuu#Anchor").line).toBe(11);
  expect(map.get("/en-US/docs/Web/Fuu#Anchor").column).toBe(16);

  const htmlFile = path.join(builtFolder, "index.html");
  const html = fs.readFileSync(htmlFile, "utf-8");
  const $ = cheerio.load(html);

  // In the loop we expect exactly 3 assertions,
  // but we have to include all the other assertions from above first!
  expect.assertions(16 + 3);
  $('article a[href*="#"]').each((i, a) => {
    const href = $(a).attr("href");
    if ((href.startsWith("/") || href.startsWith("#")) && href.split("#")[1]) {
      // All our internal links get their 'href' rewritten (on top of
      // being logged as a flaw)
      expect(href.split("#")[1]).toEqual(href.split("#")[1].toLowerCase());
    }
  });
});

test("check built flaws for /en-us/learn/css/css_layout/introduction/grid page", () => {
  expect(fs.existsSync(buildRoot)).toBeTruthy();
  const builtFolder = path.join(
    buildRoot,
    "en-us",
    "docs",
    "learn",
    "css",
    "css_layout",
    "introduction",
    "grid"
  );
  expect(fs.existsSync(builtFolder)).toBeTruthy();

  const jsonFile = path.join(builtFolder, "index.json");
  expect(fs.existsSync(jsonFile)).toBeTruthy();

  // Let's make sure there are only 2 "macros" flaws.
  const { doc } = JSON.parse(fs.readFileSync(jsonFile, "utf-8")) as {
    doc: Doc;
  };
  expect(doc.flaws).toEqual({});
});

test("check built flaws for /en-us/learn/css/css_layout/introduction/flex page", () => {
  expect(fs.existsSync(buildRoot)).toBeTruthy();
  const builtFolder = path.join(
    buildRoot,
    "en-us",
    "docs",
    "learn",
    "css",
    "css_layout",
    "introduction",
    "flex"
  );
  expect(fs.existsSync(builtFolder)).toBeTruthy();

  const htmlFile = path.join(builtFolder, "index.html");
  const html = fs.readFileSync(htmlFile, "utf-8");
  const $ = cheerio.load(html);
  // The css_layout/introduction/flex page has 2 iframes
  expect($('iframe[loading="lazy"]')).toHaveLength(2);
});

test("detect bad_bcd_queries flaws", () => {
  const builtFolder = path.join(
    buildRoot,
    "en-us",
    "docs",
    "web",
    "badbcdqueries"
  );
  expect(fs.existsSync(builtFolder)).toBeTruthy();
  const jsonFile = path.join(builtFolder, "index.json");
  const { doc } = JSON.parse(fs.readFileSync(jsonFile, "utf-8")) as {
    doc: Doc;
  };
  expect(doc.flaws.bad_bcd_queries).toHaveLength(1);
  // If the flaw is there, it's always an array because a document could
  // potentially have multiple bad BCD queries.
  expect(doc.flaws.bad_bcd_queries).toHaveLength(1);
  expect(doc.flaws.bad_bcd_queries[0].explanation).toBe(
    "No BCD data for query: api.Does.Not.exist"
  );
  expect(doc.flaws.bad_bcd_queries[0].suggestion).toBeNull();
});

test("detect bad_pre_tags flaws", () => {
  const builtFolder = path.join(
    buildRoot,
    "en-us",
    "docs",
    "learn",
    "some_code"
  );
  expect(fs.existsSync(builtFolder)).toBeTruthy();
  const jsonFile = path.join(builtFolder, "index.json");
  const { doc } = JSON.parse(fs.readFileSync(jsonFile, "utf-8")) as {
    doc: Doc;
  };
  expect(doc.flaws.bad_pre_tags).toHaveLength(1);
  const flaw = doc.flaws.bad_pre_tags[0];
  expect(flaw.explanation).toBe("<pre><code>CODE can be just <pre>CODE");
  expect(flaw.id).toBeTruthy();
  expect(flaw.fixable).toBe(true);
  expect(flaw.html).toBeTruthy();
  expect(flaw.suggestion).toBeTruthy();
  expect(flaw.line).toBe(29);
  expect(flaw.column).toBe(50);
});

test("image flaws kitchen sink", () => {
  const builtFolder = path.join(buildRoot, "en-us", "docs", "web", "images");
  const jsonFile = path.join(builtFolder, "index.json");
  const { doc } = JSON.parse(fs.readFileSync(jsonFile, "utf-8")) as {
    doc: Doc;
  };
  const { flaws } = doc;
  // You have to be intimately familiar with the fixture to understand
  // why these flaws come out as they do.
  expect(flaws.images).toHaveLength(8);
  const map = new Map(flaws.images.map((x) => [x.src, x]));

  let flaw = map.get(
    "https://www.peterbe.com/static/images/howsmywifi-scr.png"
  );
  expect(flaw.explanation).toBe("External image URL");
  expect(flaw.suggestion).toBeNull();
  expect(flaw.line).toBe(19);
  expect(flaw.column).toBe(13);

  flaw = map.get("idontexist.png");
  expect(flaw.explanation).toBe(
    "File not present on disk, an empty file, or not an image"
  );
  expect(flaw.suggestion).toBeNull();
  expect(flaw.line).toBe(34);
  expect(flaw.column).toBe(13);

  flaw = map.get("/en-US/docs/Web/Images/florian.png");
  expect(flaw.explanation).toBe("Pathname should be relative to document");
  expect(flaw.suggestion).toBe("florian.png");
  expect(flaw.line).toBe(39);
  expect(flaw.column).toBe(13);

  flaw = map.get("Florian.PNG");
  expect(flaw.explanation).toBe("Pathname should always be lowercase");
  expect(flaw.suggestion).toBe("florian.png");
  expect(flaw.line).toBe(44);
  expect(flaw.column).toBe(13);

  flaw = map.get("http://www.peterbe.com/static/images/favicon-32.png");
  expect(flaw.explanation).toBe("Insecure URL");
  expect(flaw.suggestion).toBe(
    "https://www.peterbe.com/static/images/favicon-32.png"
  );
  expect(flaw.line).toBe(49);
  expect(flaw.column).toBe(13);

  flaw = map.get(
    "https://developer.mozilla.org/en-US/docs/Web/Images/screenshot.png"
  );
  expect(flaw.explanation).toBe("Unnecessarily absolute URL");
  expect(flaw.suggestion).toBe("screenshot.png");
  expect(flaw.line).toBe(54);
  expect(flaw.column).toBe(13);

  flaw = map.get("/en-US/docs/Web/Foo/screenshot.png");
  expect(flaw.explanation).toBe("Pathname should be relative to document");
  expect(flaw.suggestion).toBe("../Foo/screenshot.png");
  expect(flaw.line).toBe(59);
  expect(flaw.column).toBe(13);

  flaw = map.get("../Foo/nonexistent.png");
  expect(flaw.explanation).toBe(
    "File not present on disk, an empty file, or not an image"
  );
  expect(flaw.suggestion).toBeNull();
  expect(flaw.line).toBe(64);
  expect(flaw.column).toBe(13);

  const htmlFile = path.join(builtFolder, "index.html");
  const html = fs.readFileSync(htmlFile, "utf-8");
  const $ = cheerio.load(html);
  $("#content img[src]").each((i, element) => {
    const img = $(element);
    const src = img.attr("src");
    if (src.includes("www.peterbe.com/")) {
      // These are forced to be https
      expect(src.startsWith("https://")).toBeTruthy();
    } else {
      expect(src.startsWith("/en-US/docs/Web/")).toBeTruthy();
    }
  });
});

test("image flaws with bad images", () => {
  const builtFolder = path.join(
    buildRoot,
    "en-us",
    "docs",
    "web",
    "images",
    "bad_src"
  );
  const jsonFile = path.join(builtFolder, "index.json");
  const { doc } = JSON.parse(fs.readFileSync(jsonFile, "utf-8")) as {
    doc: Doc;
  };
  const { flaws } = doc;
  // You have to be intimately familiar with the fixture to understand
  // why these flaws come out as they do.
  expect(flaws.images).toHaveLength(4);
  expect(
    flaws.images.filter(
      (flaw) =>
        flaw.explanation ===
        "File not present on disk, an empty file, or not an image"
    ).length
  ).toBe(4);
});

test("linked to local files", () => {
  const builtFolder = path.join(
    buildRoot,
    "en-us",
    "docs",
    "web",
    "images",
    "linked_to"
  );
  const htmlFile = path.join(builtFolder, "index.html");
  const html = fs.readFileSync(htmlFile, "utf-8");
  const $ = cheerio.load(html);
  expect.assertions(1);
  $('a[href*="dino.svg"]').each((i, element) => {
    const link = $(element);
    // The point of this test is to prove that the link becomes
    // "absolute" (i.e. starting with /)
    // If it didn't do this a link `<a href=dino.svg>`, when clicked,
    // would actually be a link to `/en-US/docs/Web/Images/dino.svg`
    // because the page `/en-US/docs/Web/Images/Linked_to` is served
    // without a trailing /.
    expect(link.attr("href")).toBe("/en-US/docs/Web/Images/Linked_to/dino.svg");
  });
});

test("image flaws with repeated external images", () => {
  // This test exists because of https://github.com/mdn/yari/issues/2247
  // which showed that if a document has an external URL repeated more than
  // once, our flaw detection only found it once.
  const builtFolder = path.join(
    buildRoot,
    "en-us",
    "docs",
    "web",
    "images",
    "repeated_external_images"
  );
  const jsonFile = path.join(builtFolder, "index.json");
  const { doc } = JSON.parse(fs.readFileSync(jsonFile, "utf-8")) as {
    doc: Doc;
  };
  const { flaws } = doc;
  // You have to be intimately familiar with the fixture to understand
  // why these flaws come out as they do.
  expect(flaws.images).toHaveLength(3);

  const flaw1 = flaws.images[0];
  const flaw2 = flaws.images[1];
  const flaw3 = flaws.images[2];
  expect(flaw1.src).toBe(flaw2.src);
  expect(flaw2.src).toBe(flaw3.src);
  expect(flaw1.line).toBe(8);
  expect(flaw2.line).toBe(13);
  expect(flaw3.line).toBe(18);
});

test("images that are in the folder but not in <img> tags", () => {
  const builtFolder = path.join(
    buildRoot,
    "en-us",
    "docs",
    "web",
    "images",
    "images_in_samples"
  );
  expect(fs.existsSync(path.join(builtFolder, "pic.gif")));
  expect(fs.existsSync(path.join(builtFolder, "image.png")));
});

test("404 page", () => {
  const builtFolder = path.join(buildRoot, "en-us", "_spas");
  expect(fs.existsSync(builtFolder)).toBeTruthy();
  const htmlFile = path.join(builtFolder, "404.html");
  const html = fs.readFileSync(htmlFile, "utf-8");
  const $ = cheerio.load(html);
  expect($("title").text()).toContain("Page not found");
  expect($("h1").text()).toContain("Page not found");
  expect($('meta[name="robots"]').attr("content")).toBe("noindex, nofollow");
  expect($('meta[property="og:locale"]').attr("content")).toBe("en-US");
});

test("plus page", () => {
  const builtFolder = path.join(buildRoot, "en-us", "plus");
  expect(fs.existsSync(builtFolder)).toBeTruthy();
  const htmlFile = path.join(builtFolder, "index.html");
  const html = fs.readFileSync(htmlFile, "utf-8");
  const $ = cheerio.load(html);
  expect($("title").text()).toContain("Plus");
  expect($('meta[name="robots"]').attr("content")).toBe("index, follow");
});

test("plus collections page", () => {
  const builtFolder = path.join(buildRoot, "en-us", "plus", "collections");
  expect(fs.existsSync(builtFolder)).toBeTruthy();
  const htmlFile = path.join(builtFolder, "index.html");
  const html = fs.readFileSync(htmlFile, "utf-8");
  const $ = cheerio.load(html);
  expect($("title").text()).toMatch(/Collection/);
  expect($('meta[name="robots"]').attr("content")).toBe("noindex, nofollow");
});

test("bcd table extraction followed by h3", () => {
  const builtFolder = path.join(
    buildRoot,
    "en-us",
    "docs",
    "web",
    "bcd_table_extraction"
  );
  expect(fs.existsSync(builtFolder)).toBeTruthy();
  const jsonFile = path.join(builtFolder, "index.json");
  const { doc } = JSON.parse(fs.readFileSync(jsonFile, "utf-8")) as {
    doc: Doc;
  };
  expect(doc.body[0].type).toBe("prose");
  expect(doc.body[1].type).toBe("prose");
  expect(doc.body[2].type).toBe("browser_compatibility");
  expect(doc.body[2].value.isH3).toBeFalsy();
  expect(doc.body[3].type).toBe("prose");
  expect(doc.body[4].type).toBe("prose");
  expect(doc.body[4].value.isH3).toBeTruthy();
});

test("specifications and bcd extraction", () => {
  const builtFolder = path.join(
    buildRoot,
    "en-us",
    "docs",
    "web",
    "spec_section_extraction"
  );
  expect(fs.existsSync(builtFolder)).toBeTruthy();
  const jsonFile = path.join(builtFolder, "index.json");
  const { doc } = JSON.parse(fs.readFileSync(jsonFile, "utf-8")) as {
    doc: Doc;
  };
  expect(doc.body[0].type).toBe("prose");
  expect(doc.body[1].type).toBe("specifications");
  expect(
    (doc.body[1] as SpecificationsSection).value.specifications[0]
      .bcdSpecificationURL
  ).toBeDefined();
  expect(doc.body[2].type).toBe("prose");
  expect(doc.body[3].type).toBe("browser_compatibility");
  expect(doc.body[4].type).toBe("prose");
});

test("headers within non-root elements is a 'sectioning' flaw", () => {
  const builtFolder = path.join(
    buildRoot,
    "en-us",
    "docs",
    "web",
    "sectioning_headers"
  );
  expect(fs.existsSync(builtFolder)).toBeTruthy();
  const jsonFile = path.join(builtFolder, "index.json");
  const { doc } = JSON.parse(fs.readFileSync(jsonFile, "utf-8")) as {
    doc: Doc;
  };
  expect(doc.flaws.sectioning[0].explanation).toBe(
    "Excess <h2> tag that is NOT at root-level (id='second', text='Second')"
  );
});

test("img tags with an empty 'src' should be a flaw", () => {
  const builtFolder = path.join(
    buildRoot,
    "en-us",
    "docs",
    "web",
    "empty_image"
  );
  expect(fs.existsSync(builtFolder)).toBeTruthy();
  const jsonFile = path.join(builtFolder, "index.json");
  const { doc } = JSON.parse(fs.readFileSync(jsonFile, "utf-8")) as {
    doc: Doc;
  };
  expect(doc.flaws.images).toHaveLength(2);
  expect(doc.flaws.images[0].explanation).toBe("Empty img 'src' attribute");
  expect(doc.flaws.images[0].fixable).toBeFalsy();
  expect(doc.flaws.images[0].externalImage).toBeFalsy();
  expect(doc.flaws.images[0].line).toBe(8);
  expect(doc.flaws.images[0].column).toBe(13);
  expect(doc.flaws.images[1].explanation).toBe("Empty img 'src' attribute");
  expect(doc.flaws.images[1].fixable).toBeFalsy();
  expect(doc.flaws.images[1].externalImage).toBeFalsy();
  expect(doc.flaws.images[1].line).toBe(17);
  expect(doc.flaws.images[1].column).toBe(11);
});

test("img with the image_widths flaw", () => {
  const builtFolder = path.join(
    buildRoot,
    "en-us",
    "docs",
    "web",
    "images",
    "styled"
  );
  expect(fs.existsSync(builtFolder)).toBeTruthy();
  const jsonFile = path.join(builtFolder, "index.json");
  const { doc } = JSON.parse(fs.readFileSync(jsonFile, "utf-8")) as {
    doc: Doc;
  };

  expect(doc.flaws.image_widths).toHaveLength(3);
  const flaw1 = doc.flaws.image_widths[0];
  expect(flaw1.explanation).toBe(
    "'width' and 'height' set in 'style' attribute on <img> tag."
  );
  expect(flaw1.fixable).toBeTruthy();
  expect(flaw1.suggestion).toBe("");
  expect(flaw1.line).toBe(27);
  expect(flaw1.column).toBe(11);

  const flaw2 = doc.flaws.image_widths[1];
  expect(flaw2.explanation).toBe(flaw1.explanation);
  expect(flaw2.fixable).toBeTruthy();
  expect(flaw2.suggestion).toBe("");
  expect(flaw2.line).toBe(35);
  expect(flaw2.column).toBe(11);

  const flaw3 = doc.flaws.image_widths[2];
  expect(flaw3.explanation).toBe(flaw1.explanation);
  expect(flaw3.fixable).toBeTruthy();
  expect(flaw3.suggestion).toBe("border-radius: 100px; max-width: 1000px;");
  expect(flaw3.line).toBe(43);
  expect(flaw3.column).toBe(12);
});

test("img tags should always have their 'width' and 'height' set", () => {
  const builtFolder = path.join(
    buildRoot,
    "en-us",
    "docs",
    "web",
    "images",
    "styled"
  );
  const htmlFile = path.join(builtFolder, "index.html");
  const html = fs.readFileSync(htmlFile, "utf-8");
  const $ = cheerio.load(html);
  // There are 5 images, so can expect there 2 be 5x2 checks in the loop...
  // But we have to account for ALL expect() calls too.
  expect.assertions(5 * 2 + 1);
  expect($("img")).toHaveLength(5);
  $("img").each((i, img) => {
    const $img = $(img);
    if ($img.attr("src").endsWith("florian.png")) {
      expect($img.attr("width")).toBe("128");
      expect($img.attr("height")).toBe("128");
    } else if ($img.attr("src").endsWith("screenshot.png")) {
      expect($img.attr("width")).toBe("250");
      expect($img.attr("height")).toBe("250");
    } else {
      throw new Error("unexpected image: " + $img.attr("src"));
    }
  });
});

test("img tags without 'src' should not crash", () => {
  const builtFolder = path.join(
    buildRoot,
    "en-us",
    "docs",
    "web",
    "images",
    "srcless"
  );
  const jsonFile = path.join(builtFolder, "index.json");
  const { doc } = JSON.parse(fs.readFileSync(jsonFile, "utf-8")) as {
    doc: Doc;
  };
  expect(doc.flaws).toEqual({});
});

test("/Web/Embeddable should have 3 valid live samples", () => {
  const builtFolder = path.join(
    buildRoot,
    "en-us",
    "docs",
    "web",
    "embeddable"
  );
  const htmlFile = path.join(builtFolder, "index.html");
  const html = fs.readFileSync(htmlFile, "utf-8");
  const $ = cheerio.load(html);
  expect($("iframe")).toHaveLength(4);

  const jsonFile = path.join(builtFolder, "index.json");
  const { doc } = JSON.parse(fs.readFileSync(jsonFile, "utf-8")) as {
    doc: Doc;
  };
  expect(doc.flaws).toEqual({});

  const builtFiles = fs.readdirSync(path.join(builtFolder, "legacy"));
  expect(
    builtFiles
      .filter((f) => f.includes("_sample_."))
      .map((f) => {
        const startOffset = "_sample_.".length;
        return f.substr(startOffset, f.length - startOffset - ".html".length);
      })
  ).toEqual(expect.arrayContaining(["foo"]));
});

test("headings with HTML should be rendered as HTML", () => {
  const builtFolder = path.join(
    buildRoot,
    "en-us",
    "docs",
    "web",
    "html_headings"
  );
  const htmlFile = path.join(builtFolder, "index.html");
  const html = fs.readFileSync(htmlFile, "utf-8");
  const $ = cheerio.load(html);

  // The page only has 1 h2, and its content should be HTML.
  expect($("article h2 a").html()).toBe("Here's some <code>code</code>");
  expect($("article h2").text()).toBe("Here's some code");
  expect($("article h3 a").html()).toBe(
    "You can use escaped HTML tags like &lt;pre&gt; still"
  );
  expect($("article h3 a").text()).toBe(
    "You can use escaped HTML tags like <pre> still"
  );

  const jsonFile = path.join(builtFolder, "index.json");
  const { doc } = JSON.parse(fs.readFileSync(jsonFile, "utf-8")) as {
    doc: Doc;
  };
  const [section1, section2] = doc.body as ProseSection[];
  // Because the title contains HTML, you can expect a 'titleAsText'
  expect(section1.value.title).toBe("Here's some <code>code</code>");
  expect(section1.value.titleAsText).toBe("Here's some code");
  expect(section2.value.title).toBe(
    "You can use escaped HTML tags like &lt;pre&gt; still"
  );
  expect(section2.value.titleAsText).toBe(
    "You can use escaped HTML tags like <pre> still"
  );
});

test("deprecated macros are fixable", () => {
  const builtFolder = path.join(
    buildRoot,
    "en-us",
    "docs",
    "web",
    "fixable_flaws",
    "deprecated_macros"
  );

  const jsonFile = path.join(builtFolder, "index.json");
  const { doc } = JSON.parse(fs.readFileSync(jsonFile, "utf-8")) as {
    doc: Doc;
  };
  expect(doc.flaws.macros).toHaveLength(1);
  // All fixable and all a suggestion of ''
  expect(doc.flaws.macros.filter((flaw) => flaw.fixable)).toHaveLength(1);
  expect(
    doc.flaws.macros.filter((flaw) => flaw.suggestion === "")
  ).toHaveLength(1);
});

test("external links always get the right attributes", () => {
  const builtFolder = path.join(
    buildRoot,
    "en-us",
    "docs",
    "web",
    "externallinks"
  );
  const htmlFile = path.join(builtFolder, "index.html");
  const html = fs.readFileSync(htmlFile, "utf-8");
  const $ = cheerio.load(html);
  // 4 links on that page and we'll do 2 assertions for each one, plus
  // 1 for the extra sanity check.
  expect.assertions(4 * 2 + 1);
  expect($("article > section div a")).toHaveLength(4); // sanity check
  $("article > section div a").each((i, element) => {
    const $a = $(element);
    expect($a.hasClass("external")).toBe(true);
    expect($a.attr("target")).toBe("_blank");
  });
});

test("home page should have a /index.json file with pullRequestsData", () => {
  const builtFolder = path.join(buildRoot, "en-us");

  const jsonFile = path.join(builtFolder, "index.json");
  const { hyData: { recentContributions = {} } = {} } = JSON.parse(
    fs.readFileSync(jsonFile, "utf-8")
  );
  expect(recentContributions.items.length).toBeGreaterThan(0);
});

test("headings with links in them are flaws", () => {
  const builtFolder = path.join(
    buildRoot,
    "en-us",
    "docs",
    "web",
    "heading_links"
  );

  const jsonFile = path.join(builtFolder, "index.json");
  const { doc } = JSON.parse(fs.readFileSync(jsonFile, "utf-8")) as {
    doc: Doc;
  };
  expect(doc.flaws.heading_links).toHaveLength(2);
  const map = new Map(doc.flaws.heading_links.map((x) => [x.id, x]));
  expect(map.get("heading_links1").explanation).toBe(
    "h2 heading contains an <a> tag"
  );
  expect(map.get("heading_links1").suggestion).toBe("One");
  expect(map.get("heading_links1").line).toBe(9);
  expect(map.get("heading_links1").column).toBe(19);
  expect(map.get("heading_links1").fixable).toBe(false);
  expect(map.get("heading_links1").before).toBe('<a href="#something">One</a>');
  expect(map.get("heading_links1").html).toBe(
    '<h2 id="one"><a href="#something">One</a></h2>'
  );
  expect(map.get("heading_links2").explanation).toBe(
    "h3 heading contains an <a> tag"
  );
  expect(map.get("heading_links2").suggestion.trim()).toBe("Two");
  expect(map.get("heading_links2").line).toBe(11);
  expect(map.get("heading_links2").column).toBe(19);
  expect(map.get("heading_links2").fixable).toBe(false);
  expect(map.get("heading_links2").before.trim()).toBe(
    '<a id="twoooo">Two</a>'
  );
  expect(map.get("heading_links2").html).toBe(
    '<h3 id="two">\n  <a id="twoooo">Two</a>\n</h3>'
  );
});

test("'lang' attribute should match the article", () => {
  let builtFolder = path.join(buildRoot, "fr", "docs", "web", "foo");
  let htmlFile = path.join(builtFolder, "index.html");
  let html = fs.readFileSync(htmlFile, "utf-8");
  let $ = cheerio.load(html);
  expect($("html").attr("lang")).toBe("en-US");
  expect($("article").attr("lang")).toBe("fr");

  builtFolder = path.join(buildRoot, "en-us", "docs", "web", "foo");
  htmlFile = path.join(builtFolder, "index.html");
  html = fs.readFileSync(htmlFile, "utf-8");
  $ = cheerio.load(html);
  expect($("html").attr("lang")).toBe("en-US");
  expect($("article").attr("lang")).toBe("en-US");
});

test("basic markdown rendering", () => {
  const builtFolder = path.join(buildRoot, "en-us", "docs", "markdown");
  const htmlFile = path.join(builtFolder, "index.html");
  const html = fs.readFileSync(htmlFile, "utf-8");
  const $ = cheerio.load(html);
  // Following elements do not test TOC rendering
  $("article > .metadata").remove();

  expect($("article h2[id]")).toHaveLength(2);
  expect($("article h3[id]")).toHaveLength(3);
  expect($("article p code")).toHaveLength(2);
  expect($("article strong")).toHaveLength(2);
  expect($("article em")).toHaveLength(1);
  expect($("article ul li")).toHaveLength(6);
  expect($('article a[href^="/"]')).toHaveLength(2);
  expect($('article a[href^="#"]')).toHaveLength(5);
  expect($("article pre")).toHaveLength(4);
  expect($("article pre.notranslate")).toHaveLength(4);
  expect($("article pre.css").hasClass("brush:")).toBe(true);
  expect($("article pre.javascript").hasClass("brush:")).toBe(true);
  expect($("article .fancy strong")).toHaveLength(1);

  const jsonFile = path.join(builtFolder, "index.json");
  const { doc } = JSON.parse(fs.readFileSync(jsonFile, "utf-8")) as {
    doc: Doc;
  };
  expect(Object.keys(doc.flaws)).toHaveLength(1);
  expect(doc.flaws.bad_pre_tags).toHaveLength(1);
});

test("unsafe HTML gets flagged as flaws and replace with its raw HTML", () => {
  const builtFolder = path.join(
    buildRoot,
    "en-us",
    "docs",
    "web",
    "unsafe_html"
  );

  const jsonFile = path.join(builtFolder, "index.json");
  const { doc } = JSON.parse(fs.readFileSync(jsonFile, "utf-8")) as {
    doc: Doc;
  };
  expect(doc.flaws.unsafe_html).toHaveLength(7);

  const htmlFile = path.join(builtFolder, "index.html");
  const html = fs.readFileSync(htmlFile, "utf-8");
  const $ = cheerio.load(html);
  expect($("code.unsafe-html")).toHaveLength(7);
});

test("translated content broken links can fall back to en-us", () => {
  const builtFolder = path.join(buildRoot, "fr", "docs", "web", "foo");
  const jsonFile = path.join(builtFolder, "index.json");

  // We should be able to read it and expect certain values
  const { doc } = JSON.parse(fs.readFileSync(jsonFile, "utf-8")) as {
    doc: Doc;
  };
  const map = new Map(doc.flaws.broken_links.map((x) => [x.href, x]));
  expect(map.get("/fr/docs/Web/CSS/dumber").explanation).toBe(
    "Can use the English (en-US) link as a fallback"
  );
  expect(map.get("/fr/docs/Web/CSS/number").explanation).toBe(
    "Can use the English (en-US) link as a fallback"
  );

  const htmlFile = path.join(builtFolder, "index.html");
  const html = fs.readFileSync(htmlFile, "utf-8");
  const $ = cheerio.load(html);
  expect($('article a[href="/fr/docs/Web/CSS/dumber"]')).toHaveLength(0);
  expect($('article a[href="/fr/docs/Web/CSS/number"]')).toHaveLength(0);
  expect($('article a[href="/en-US/docs/Web/CSS/number"]')).toHaveLength(2);
  expect($("article a.only-in-en-us")).toHaveLength(2);
  expect($("article a.only-in-en-us").attr("title")).toBe(
    "Currently only available in English (US)"
  );
});

test("notecards are correctly transformed by the formatNotecards utility", () => {
  const builtFolder = path.join(
    buildRoot,
    "en-us",
    "docs",
    "web",
    "check_notecards"
  );

  const jsonFile = path.join(builtFolder, "index.json");
  const { doc } = JSON.parse(fs.readFileSync(jsonFile, "utf-8")) as {
    doc: Doc;
  };
  expect(doc.flaws).toStrictEqual({});
  expect(doc.title).toBe(
    "A page representing some edge cases of div.notecard that we might encounter"
  );

  const htmlFile = path.join(builtFolder, "index.html");
  const html = fs.readFileSync(htmlFile, "utf-8");
  const $ = cheerio.load(html);

  expect($("div.notecard h4")).toHaveLength(0);
  expect($("div.notecard.note").html()).toBe(
    "<p><strong>Some heading:</strong> No paragraph here.</p><p>Paragraph 2</p>"
  );
  expect($("div.notecard.warning").html()).toBe(
    "<p><strong>Some heading:</strong> Paragraph 1</p><p>Paragraph 2</p>"
  );
  expect($("div.notecard.extra").html()).toBe(
    "<p><strong>Some heading:</strong> Paragraph 1</p><span>Foo bar</span><p>Paragraph 2</p>"
  );
});

test("homepage links and flaws", () => {
  const builtFolder = path.join(
    buildRoot,
    "en-us",
    "docs",
    "web",
    "homepage_links"
  );
  const jsonFile = path.join(builtFolder, "index.json");
  const { doc } = JSON.parse(fs.readFileSync(jsonFile, "utf-8")) as {
    doc: Doc;
  };
  expect(doc.flaws.broken_links).toHaveLength(4);
  const map = new Map(doc.flaws.broken_links.map((x) => [x.href, x]));
  expect(map.get("/ru").suggestion).toBe("/ru/");
  expect(map.get("/JA/").suggestion).toBe("/ja/");
  expect(map.get("/ZH-CN").suggestion).toBe("/zh-CN/");
  expect(map.get("/notalocale/").suggestion).toBeFalsy();
});

test("built search-index.json (en-US)", () => {
  const searchIndexFile = path.join(buildRoot, "en-us", "search-index.json");
  const searchIndex = JSON.parse(fs.readFileSync(searchIndexFile, "utf-8"));
  const urlToTitle = new Map(searchIndex.map((o) => [o.url, o.title]));
  expect(urlToTitle.get("/en-US/docs/Web/Foo")).toBe("<foo>: A test tag");
});

test("the robots.txt file was created", () => {
  const filePath = path.join(buildRoot, "robots.txt");
  const text = fs.readFileSync(filePath, "utf-8");
  // The content of robots file when it's in production mode is
  // to ONLY say `Disallow: /api/`.
  // When the robots file is for disallowing everything it
  // will ONLY say `Disallow: /`.
  expect(text).toContain("Disallow: /api/");
  expect(text).not.toContain("Disallow: /\n");
});

test("duplicate IDs are de-duplicated", () => {
  const builtFolder = path.join(
    buildRoot,
    "en-us",
    "docs",
    "web",
    "duplicate_ids"
  );
  const jsonFile = path.join(builtFolder, "index.json");
  const { doc } = JSON.parse(fs.readFileSync(jsonFile, "utf-8")) as {
    doc: Doc;
  };
  const sectionIDs = doc.body.map((section) => section.value.id);
  // The section IDs aren't normalized to lowercase but the should be
  // unique if they were case normalized.
  expect(new Set(sectionIDs.map((id) => id.toLowerCase())).size).toEqual(
    sectionIDs.length
  );

  const htmlFile = path.join(builtFolder, "index.html");
  const html = fs.readFileSync(htmlFile, "utf-8");
  const $ = cheerio.load(html);
  const h2IDs = [];
  $("#content main h2").each((i, element) => {
    h2IDs.push($(element).attr("id"));
  });
  expect(new Set(h2IDs.map((id) => id.toLowerCase())).size).toEqual(
    h2IDs.length
  );
});
