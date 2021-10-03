const { assert, itMacro, describeMacro, lintHTML } = require("./utils");

const jsdom = require("jsdom");
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
