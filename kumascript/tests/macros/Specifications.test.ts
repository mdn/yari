import { assert, itMacro, describeMacro, lintHTML } from "./utils";

import { JSDOM } from "jsdom";

describeMacro("Specifications", function () {
  itMacro("Outputs a simple div tag", async (macro) => {
    const result = await macro.call("api.feature");
    const dom = JSDOM.fragment(result);
    const div = dom.querySelector<HTMLDivElement>("div.bc-specs");
    assert.equal(div.dataset.bcdQuery, "api.feature");
    assert.equal(
      div.textContent.trim(),
      "If you're able to see this, something went wrong on this page."
    );
  });

  itMacro("Outputs valid HTML", async (macro) => {
    const result = await macro.call("api.feature");
    expect(lintHTML(result)).toBeFalsy();
  });
});
