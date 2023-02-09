import { assert, itMacro, describeMacro, lintHTML } from "./utils.js";

import { JSDOM } from "jsdom";

describeMacro("Specifications", function () {
  itMacro("Outputs a simple div tag (browser-compat case)", async (macro) => {
    macro.ctx.env["browser-compat"] = "api.feature";
    const result = await macro.call();
    const dom = JSDOM.fragment(result);
    const div = dom.querySelector<HTMLDivElement>("div.bc-specs");
    assert.equal(div.dataset.bcdQuery, "api.feature");
    assert.equal(
      div.textContent.trim(),
      "If you're able to see this, something went wrong on this page."
    );
  });

  itMacro("Outputs a simple div tag (spec-urls case)", async (macro) => {
    macro.ctx.env["spec-urls"] = "https://example.com";
    const result = await macro.call();
    const dom = JSDOM.fragment(result);
    assert.equal(
      dom.querySelector("div.bc-specs").getAttribute("data-spec-urls"),
      "https://example.com"
    );
    assert.equal(
      dom.querySelector("div.bc-specs").textContent.trim(),
      "If you're able to see this, something went wrong on this page."
    );
  });

  itMacro("Outputs valid HTML (browser-compat case)", async (macro) => {
    macro.ctx.env["browser-compat"] = "api.feature";
    const result = await macro.call();
    expect(lintHTML(result)).toBeFalsy();
  });

  itMacro("Outputs valid HTML (spec-urls case)", async (macro) => {
    macro.ctx.env["spec-urls"] = "https://example.com";
    const result = await macro.call();
    expect(lintHTML(result)).toBeFalsy();
  });

  itMacro("Accepts an array from browser-compat", async (macro) => {
    macro.ctx.env["browser-compat"] = ["api.feature1", "api.feature2"];
    const result = await macro.call();
    const dom = JSDOM.fragment(result);
    assert.equal(
      dom
        .querySelector("div.bc-specs")
        .getAttribute("data-bcd-query")
        .split(",").length,
      2
    );
    expect(lintHTML(result)).toBeFalsy();
  });

  itMacro("Accepts an array from spec-urls", async (macro) => {
    macro.ctx.env["spec-urls"] = ["https://a.com", "https://b.com"];
    const result = await macro.call();
    const dom = JSDOM.fragment(result);
    assert.equal(
      dom
        .querySelector("div.bc-specs")
        .getAttribute("data-spec-urls")
        .split(",").length,
      2
    );
    expect(lintHTML(result)).toBeFalsy();
  });
});
