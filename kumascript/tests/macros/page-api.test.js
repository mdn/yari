/**
 * @prettier
 */

// There used to be a DekiScript-Page.ejs macro, and this test
// tested its main functions. The features of that macro are now
// part of ../../src/environment.js, but we're still testing them here.

const fs = require("fs");
const path = require("path");
const { Document } = require("../../../content");
const { assert, itMacro, describeMacro, beforeEachMacro } = require("./utils");

// Load fixture data.
const fixtureData = JSON.parse(
  fs.readFileSync(
    path.resolve(__dirname, "fixtures", "documentData1.json"),
    "utf8"
  )
);
const fix_url = "/en-US/docs/Web/HTTP/Basics_of_HTTP";
const titles = [
  "Choosing between www and non-www URLs",
  "Data URLs",
  "Evolution of HTTP",
  "Identifying resources on the Web",
  "MIME types (IANA media types)",
];

function getProps(items, prop_name) {
  const result = [];
  for (const item of items) {
    result.push(item[prop_name]);
  }
  return result;
}

function checkSubpagesResult(res) {
  assert.isArray(res);
  assert.equal(res.length, 5);
  assert.sameMembers(getProps(res, "title"), titles);
  assert.sameMembers(res[0].tags, ["Guide", "HTTP", "URL"]);
  assert.equal(res[0].translations.length, 0);
  // TODO: Either remove or reinstate depending upon what we do with L10n.
  // assert.equal(res[0].translations.length, 2);
  // assert.sameMembers(getProps(res[0].translations, "locale"), ["es", "fr"]);
  // assert.sameMembers(getProps(res[0].translations, "url"), [
  //   "/es/docs/Web/HTTP/Basics_of_HTTP/Choosing_between_www_and_non-www_URLs",
  //   "/fr/docs/Web/HTTP/Basics_of_HTTP/Choisir_entre_les_URLs_www_sans_www",
  // ]);
  // assert.sameMembers(getProps(res[0].translations, "title"), [
  //   "Elección entre www y no-www URLs",
  //   "Choisir entre les URLs avec ou sans www",
  // ]);
  // assert.property(res[0].translations[0], "summary");
  // assert.property(res[0].translations[1], "summary");
  assert.equal(res[4].subpages.length, 1);
}

// TODO: Either remove or reinstate depending upon what we do with L10n.
// function checkTranslationsResult(res) {
//   assert.isArray(res);
//   assert.equal(res.length, 2);
//   assert.sameMembers(getProps(res, "locale"), ["es", "fr"]);
//   assert.sameMembers(getProps(res, "url"), [
//     "/es/docs/Web/HTTP/Basics_of_HTTP",
//     "/fr/docs/Web/HTTP/Basics_of_HTTP",
//   ]);
//   assert.sameMembers(getProps(res, "title"), [
//     "Conceptos básicos de HTTP",
//     "L'essentiel de HTTP",
//   ]);
//   assert.property(res[0], "summary");
//   assert.property(res[1], "summary");
// }

describeMacro("page API tests", function () {
  beforeEachMacro(function (macro) {
    macro.ctx.info.cleanURL = jest.fn((url) =>
      new URL(url, "https://example.com").pathname.toLowerCase()
    );
    Document.findByURL = jest.fn((url) => {
      const data = fixtureData[url.toLowerCase()];
      if (!data) {
        return null;
      }
      return {
        url: data.url,
        metadata: {
          title: data.title,
          locale: data.locale,
          summary: data.summary,
          slug: data.slug,
          tags: data.tags,
        },
      };
    });
    Document.findChildren = jest.fn((url) => {
      const result = [];
      const parent = `${url.toLowerCase()}/`;
      for (const [key, data] of Object.entries(fixtureData)) {
        if (!key.replace(parent, "").includes("/")) {
          key.replace(`${url.toLowerCase()}/`, "");
          result.push({
            url: data.url,
            metadata: {
              title: data.title,
              locale: data.locale,
              summary: data.summary,
              slug: data.slug,
              tags: data.tags,
            },
          });
        }
      }
      return result;
    });
  });
  itMacro("dummy", function (macro) {
    const pkg = macro.ctx.page;
    assert.isObject(pkg);
    assert.isFunction(pkg.hasTag);
    assert.isFunction(pkg.subpages);
    assert.isFunction(pkg.subpagesExpand);
    assert.isFunction(pkg.subPagesFlatten);
    assert.isFunction(pkg.translations);
  });
  describe('test "subpages"', function () {
    itMacro("One argument (non-null)", function (macro) {
      const res = macro.ctx.page.subpages(fix_url);
      checkSubpagesResult(res);
    });
    itMacro("One argument (null)", function (macro) {
      macro.ctx.env.url = fix_url;
      const res = macro.ctx.page.subpages(null);
      checkSubpagesResult(res);
    });
    itMacro("Two arguments (self=true)", function (macro) {
      const res = macro.ctx.page.subpages(fix_url, 2, true);
      assert.isArray(res);
      assert.equal(res.length, 1);
      assert.equal(res[0].slug, "Web/HTTP/Basics_of_HTTP");
      checkSubpagesResult(res[0].subpages);
    });
  });
  describe('test "subpagesExpand"', function () {
    itMacro("One argument (non-null)", function (macro) {
      const res = macro.ctx.page.subpagesExpand(fix_url);
      checkSubpagesResult(res);
    });
    itMacro("One argument (null)", function (macro) {
      macro.ctx.env.url = fix_url;
      const res = macro.ctx.page.subpagesExpand(null);
      checkSubpagesResult(res);
    });
    itMacro("Two arguments (self=true)", function (macro) {
      const res = macro.ctx.page.subpagesExpand(fix_url, 2, true);
      assert.isArray(res);
      assert.equal(res.length, 1);
      assert.equal(res[0].slug, "Web/HTTP/Basics_of_HTTP");
      checkSubpagesResult(res[0].subpages);
    });
  });
  describe('test "translations"', function () {
    itMacro("One argument (non-null)", function (macro) {
      const res = macro.ctx.page.translations(fix_url);
      assert.equal(res.length, 0);
      // TODO: Either remove or reinstate depending upon what we do with L10n.
      // checkTranslationsResult(res);
    });
    itMacro("One argument (null)", function (macro) {
      macro.ctx.env.url = fix_url;
      const res = macro.ctx.page.translations(null);
      assert.equal(res.length, 0);
      // TODO: Either remove or reinstate depending upon what we do with L10n.
      // checkTranslationsResult(res);
    });
    itMacro("One argument (throws error)", function (macro) {
      const junk_url = "/en-US/docs/junk";
      expect(() => macro.ctx.page.translations(junk_url)).toThrow(
        `${junk_url.toLowerCase()} (url: ${junk_url}) does not exist`
      );
    });
  });
});
