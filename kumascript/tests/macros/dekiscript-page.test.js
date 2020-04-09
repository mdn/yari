/**
 * @prettier
 */

// There used to be a DekiScript-Page.ejs macro, and this test
// tested its main functions. The features of that macro are now
// part of ../../src/environment.js, but we're still testing them here.

const fs = require("fs");
const path = require("path");
const AllPagesInfo = require("../../src/info.js");
const { assert, itMacro, describeMacro, beforeEachMacro } = require("./utils");

const fixture_dir = path.resolve(__dirname, "fixtures");

// Load fixture data.
const fixtures = {
  all: {
    data: null,
    filename: "allTitles1.json",
  },
};
for (const name in fixtures) {
  fixtures[name].data = JSON.parse(
    fs.readFileSync(path.resolve(fixture_dir, fixtures[name].filename), "utf8")
  );
}
const base_url = "https://developer.mozilla.org";
const fix_url = "/en-US/docs/Web/HTTP/Basics_of_HTTP";
const titles = [
  "Choosing between www and non-www URLs",
  "Data URLs",
  "Evolution of HTTP",
  "Identifying resources on the Web",
  "MIME types (IANA media types)",
];

function getProps(items, prop_name) {
  var result = [];
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
  assert.equal(res[0].translations.length, 2);
  assert.sameMembers(getProps(res[0].translations, "locale"), ["es", "fr"]);
  assert.sameMembers(getProps(res[0].translations, "url"), [
    "/es/docs/Web/HTTP/Basics_of_HTTP/Choosing_between_www_and_non-www_URLs",
    "/fr/docs/Web/HTTP/Basics_of_HTTP/Choisir_entre_les_URLs_www_sans_www",
  ]);
  assert.sameMembers(getProps(res[0].translations, "title"), [
    "Elección entre www y no-www URLs",
    "Choisir entre les URLs avec ou sans www",
  ]);
  assert.property(res[0].translations[0], "summary");
  assert.property(res[0].translations[1], "summary");
  assert.equal(res[4].subpages.length, 1);
}

function checkTranslationsResult(res) {
  assert.isArray(res);
  assert.equal(res.length, 2);
  assert.sameMembers(getProps(res, "locale"), ["es", "fr"]);
  assert.sameMembers(getProps(res, "url"), [
    "/es/docs/Web/HTTP/Basics_of_HTTP",
    "/fr/docs/Web/HTTP/Basics_of_HTTP",
  ]);
  assert.sameMembers(getProps(res, "title"), [
    "Conceptos básicos de HTTP",
    "L'essentiel de HTTP",
  ]);
  assert.property(res[0], "summary");
  assert.property(res[1], "summary");
}

describeMacro("dekiscript-page", function () {
  itMacro("dummy", function (macro) {
    let pkg = macro.ctx.page;
    assert.isObject(pkg);
    assert.isFunction(pkg.hasTag);
    assert.isFunction(pkg.subpages);
    assert.isFunction(pkg.subpagesExpand);
    assert.isFunction(pkg.subPagesFlatten);
    assert.isFunction(pkg.translations);
  });
  describe('test "subpages"', function () {
    beforeEachMacro(function (macro) {
      macro.ctx.info = new AllPagesInfo(fixtures.all.data);
    });
    itMacro("One argument (non-null)", function (macro) {
      const res = macro.ctx.page.subpages(fix_url);
      checkSubpagesResult(res);
    });
    itMacro("One argument (null)", function (macro) {
      macro.ctx.env.url = base_url + fix_url;
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
    beforeEachMacro(function (macro) {
      macro.ctx.info = new AllPagesInfo(fixtures.all.data);
    });
    itMacro("One argument (non-null)", function (macro) {
      const res = macro.ctx.page.subpagesExpand(fix_url);
      checkSubpagesResult(res);
    });
    itMacro("One argument (null)", function (macro) {
      macro.ctx.env.url = base_url + fix_url;
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
    beforeEachMacro(function (macro) {
      macro.ctx.info = new AllPagesInfo(fixtures.all.data);
    });
    itMacro("One argument (non-null)", function (macro) {
      const res = macro.ctx.page.translations(fix_url);
      checkTranslationsResult(res);
    });
    itMacro("One argument (null)", function (macro) {
      macro.ctx.env.url = base_url + fix_url;
      const res = macro.ctx.page.translations(null);
      checkTranslationsResult(res);
    });
    itMacro("One argument (return null)", function (macro) {
      const junk_url = "/en-US/docs/junk";
      const res = macro.ctx.page.translations(junk_url);
      assert.isArray(res);
      assert.equal(res.length, 0);
    });
  });
});
