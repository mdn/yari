// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'assert'.
const { assert, itMacro, describeMacro, lintHTML } = require("./utils");

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'jsdom'.
const jsdom = require("jsdom");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'JSDOM'.
const { JSDOM } = jsdom;

describeMacro("Specifications", function () {
  itMacro("Outputs a simple div tag", async (macro) => {
    const result = await macro.call("api.feature");
    const dom = JSDOM.fragment(result);
    assert.equal(
      dom.querySelector("div.bc-specs").dataset.bcdQuery,
      "api.feature"
    );
    assert.equal(
      dom.querySelector("div.bc-specs").textContent.trim(),
      "If you're able to see this, something went wrong on this page."
    );
  });

  itMacro("Outputs valid HTML", async (macro) => {
    const result = await macro.call("api.feature");
    expect(lintHTML(result)).toBeFalsy();
  });
});
