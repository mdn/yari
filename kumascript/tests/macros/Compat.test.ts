// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'assert'.
const { assert, itMacro, describeMacro, lintHTML } = require("./utils");

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'fs'.
const fs = require("fs");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'path'.
const path = require("path");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'jsdom'.
const jsdom = require("jsdom");
const extend = require("extend");
const dirname = __dirname;
const fixture_dir = path.resolve(dirname, "fixtures/compat");

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'JSDOM'.
const { JSDOM } = jsdom;

let fixtureCompatData = {};
fs.readdirSync(fixture_dir).forEach(function (fn) {
  fixtureCompatData = extend(
    true,
    fixtureCompatData,
    JSON.parse(fs.readFileSync(path.resolve(fixture_dir, fn), "utf8"))
  );
});

describeMacro("Compat", function () {
  itMacro("Outputs a simple div tag", async (macro) => {
    const result = await macro.call("api.feature");
    const dom = JSDOM.fragment(result);
    assert.equal(dom.querySelector("div.bc-data").id, "");
    assert.equal(dom.querySelector("div.bc-data").dataset.query, "api.feature");
    assert.equal(dom.querySelector("div.bc-data").dataset.depth, "1");
    assert.equal(
      dom.querySelector("div.bc-data").textContent.trim(),
      "If you're able to see this, something went wrong on this page."
    );
  });

  itMacro("Outputs the data-depth on the second parameter", async (macro) => {
    const result = await macro.call("api.feature", 2);
    const dom = JSDOM.fragment(result);
    assert.equal(dom.querySelector("div.bc-data").dataset.depth, "2");
  });

  itMacro("Outputs valid HTML", async (macro) => {
    const result = await macro.call("api.feature");
    expect(lintHTML(result)).toBeFalsy();
  });
});
